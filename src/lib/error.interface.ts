import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Errorr {
  @Field(() => String)
  error: boolean;
  @Field(() => String)
  message: string;
}