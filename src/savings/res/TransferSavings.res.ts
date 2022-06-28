import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Errorr {
  @Field(() => String)
  error: boolean;
  @Field(() => String)
  message: string;
}

@ObjectType()
export class TransferSavingsToEscrowResponse {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Errorr, { nullable: true })
  error?: Errorr;
}
