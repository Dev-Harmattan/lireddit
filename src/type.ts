import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';

export type MyContex = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
