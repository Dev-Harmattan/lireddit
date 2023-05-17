import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContex = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Express.Session & { userId: number } };
  res: Response;
  redis: Redis;
};

export interface EmailTeplate {
  subject?: string;
  url: string;
}
