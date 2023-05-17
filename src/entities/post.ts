import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity
} from 'typeorm';
import dotenv from 'dotenv';
import { Field, ObjectType } from 'type-graphql';
dotenv.config();

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;
}
