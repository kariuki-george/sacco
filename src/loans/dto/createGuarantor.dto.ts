import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateGuarantorDto {
  @Field(() => ID)
  userId: Types.ObjectId;

  @Field(() => Int)
  amount: number;
}
