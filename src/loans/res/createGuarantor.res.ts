import { Field, ObjectType, } from '@nestjs/graphql';

@ObjectType()
export class CreateGuarantorResponse {
  @Field(() => String)
  token: string;
}
