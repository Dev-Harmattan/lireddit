import { Field, InputType } from 'type-graphql';

@InputType()
export class UsernamePasswordOption {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}
