import { InputType, Int, ID, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateLoanDto {
  @IsPositive()
  @IsNotEmpty()
  @Field(() => Int)
  amount: number;
  @Field(() => ID)
  @IsNotEmpty()
  userId: Types.ObjectId;
  @Field(() => ID)
  @IsNotEmpty()
  loanTypeId: Types.ObjectId;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  token?: string;
  processing: boolean;
  guarantor?: boolean;
  bankId: Types.ObjectId;
  canWithdraw: boolean;
  amountRemaining?: number;
}
