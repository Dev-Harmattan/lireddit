import 'reflect-metadata';
import * as dotenv from 'dotenv';
import AppDataSource from './dataSource';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';

import connectRedis from 'connect-redis';
import session from 'express-session';
import Redis from 'ioredis';
// import { User } from './entities/user';
// import { Post } from './entities/post';
dotenv.config();

const main = async () => {
  await AppDataSource.initialize();

  // await Post.delete({});
  // await User.delete({})

  await AppDataSource.runMigrations();

  const app = express();

  const redis = new Redis();
  const RedisStore = connectRedis(session);

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: process.env.COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // cookies only work in https when this is true
        sameSite: 'lax', // prevent aginst csrf
      },
      resave: false,
      saveUninitialized: false,
      secret: process.env.SECRET_KEY!,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
    plugins: [],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('Server listen at port 4000');
  });
};

main().catch((er) => console.log(er));
