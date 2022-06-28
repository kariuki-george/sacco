import { Field, ObjectType } from '@nestjs/graphql';
import { Errorr } from 'src/lib/error.interface';



@ObjectType()
export class TransferSavingsToEscrowResponse {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Errorr, { nullable: true })
  error?: Errorr;
}
