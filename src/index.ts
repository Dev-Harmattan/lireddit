import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import * as dotenv from 'dotenv';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  // const post = orm.em.create(Post, {
  //   title: 'Hello World!',
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // });
  // await orm.em.persistAndFlush(post);

  // const post = await orm.em.find(Post, {});
  // console.log(post)

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({
      em: orm.em,
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Server listen at port 4000');
  });
};

main().catch((er) => console.log(er));
