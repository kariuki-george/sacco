import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class DepositDto {
  @IsNumber()
  @IsPositive()
  @Field(() => Int)
  amount: number;

  @IsNotEmpty()
  @Field(() => ID)
  userId: Types.ObjectId;

  @Field(() => Int, { nullable: true })
  phoneNumber: number;
}
