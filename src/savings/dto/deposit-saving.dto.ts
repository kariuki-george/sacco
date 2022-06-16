import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import mongoose, { Types } from 'mongoose';

@InputType()
export class DepositIntoSavingAccountDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: Types.ObjectId;
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
  @Field(() => ID)
  @IsNotEmpty()
  savingsId: Types.ObjectId;
  @Field(() => ID, { nullable: true })
  bankId: mongoose.Schema.Types.ObjectId;
}
