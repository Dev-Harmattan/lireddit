import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import dotenv from 'dotenv';
dotenv.config();

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date()})
  updatedAt: Date = new Date();

  @Property({ type: 'text' })
  title!: string;
}
