import { DataSource } from 'typeorm';
import { User } from './entities/user';
import { Post } from './entities/post';
import path from 'path';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.PGL_USER,
  password: process.env.PGL_PASSWORD,
  database: process.env.DB_NAME2,
  logging: true,
  synchronize: true,
  migrations: [path.join(__dirname, './migrations/*')],
  entities: [User, Post],
});

export default AppDataSource;
