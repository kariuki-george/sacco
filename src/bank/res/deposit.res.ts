import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class DepositDto {
  @Field(() => String)
  type: string;
  @Field(() => Int)
  amount: number;
  @Field(() => String)
  from: string;
  @Field(() => String)
  to: string;

  @Field(() => ID)
  userId: Types.ObjectId;
  @Field(() => String)
  requestId?: string;
}
