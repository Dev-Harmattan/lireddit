import { User } from '../entities/user';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';

import { MyContex } from '../type';

@InputType()
class UsernamePasswordOption {
  @Field()
  username: string;

  @Field()
  password: string;
}

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
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordOption,
    @Ctx() { em }: MyContex
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Length must greater than 2',
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Length must greater than 3',
          },
        ],
      };
    }

    const hashPassword = await argon2.hash(options.password);
    // @ts-ignore
    const user = await em.create(User, {
      username: options.username,
      password: hashPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if(error.code === '23505' || error?.detail?.includes('already exists')){
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

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordOption,
    @Ctx() { em }: MyContex
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: 'username or password',
            message: 'Username or password is incorrect',
          },
        ],
      };
    }

    const isValidPassword = await argon2.verify(
      user.password,
      options.password
    );
    if (!isValidPassword) {
      return {
        errors: [
          {
            field: 'username or password',
            message: 'Username or password is incorrect',
          },
        ],
      };
    }

    return {
      user,
    };
  }
}
