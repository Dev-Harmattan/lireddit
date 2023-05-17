import { User } from '../entities/user';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { MyContex } from '../type';
import { UsernamePasswordOption } from '../types/UsernamePasswordOption';
import { validateUserRegister } from '../utils/validateUserRegister';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplate } from '../utils/template';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContex) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() { redis, em, req }: MyContex
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Length must greater than 3',
          },
        ],
      };
    }
    const key = process.env.FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exist',
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    em.persistAndFlush(user);

    await redis.del(key);

    //log in user
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContex
  ) {
    const user = await em.findOne(User, { email });
    if (!user) return true;

    const token = uuidv4();

    const key = process.env.FORGET_PASSWORD_PREFIX + token;

    await redis.set(key, user.id, 'EX', 1000 * 60 * 60 * 24 * 3); // 3 DAYS EXPIRED

    const templateOption = {
      subject: 'Click on the lick below to reset your password',
      url: `http://localhost:3000/change-password/${token}`,
    };

    const template = emailTemplate(templateOption);
    await sendEmail(email, template, templateOption.subject);

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordOption,
    @Ctx() { em, req }: MyContex
  ): Promise<UserResponse> {
    const errors = validateUserRegister(options);
    if (errors) {
      // @ts-ignore
      return { errors };
    }

    const hashPassword = await argon2.hash(options.password);
    // @ts-ignore
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === '23505' || error?.detail?.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    //keep user login after register
    // store user id in cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContex
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'Username or Email is incorrect',
          },
        ],
      };
    }

    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password is incorrect',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContex) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          resolve(false);
          return;
        }
        res.clearCookie('qid');
        resolve(true);
      });
    });
  }
}
