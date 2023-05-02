import { MikroORM } from '@mikro-orm/core';
import * as dotenv from 'dotenv';
import mikroOrmConfig from './mikro-orm.config';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
};

main().catch((er) => console.log(er));
