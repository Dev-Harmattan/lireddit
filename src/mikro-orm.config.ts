import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/post';
import Path from 'path';
import { User } from './entities/user';

export default {
  migrations: {
    path: Path.join(__dirname, './migrations'),
    glob: '!(*.d).{js,ts}',
  },
  entities: [Post, User],
  user: process.env.PGL_USER,
  port: 5432,
  dbName: process.env.DB_NAME,
  password: process.env.PGL_PASSWORD,
  type: 'postgresql',
  debug: process.env.DEV_ENV !== 'production',
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
