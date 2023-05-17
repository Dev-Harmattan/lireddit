import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContex = {
  req: Request & { session: Express.Session & { userId: number } };
  res: Response;
  redis: Redis;
};

export interface EmailTeplate {
  subject?: string;
  url: string;
}
