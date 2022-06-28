import { InputType, Int, ID, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';


@InputType()
export class CreateLoanDto {
  @IsPositive()
  @IsNotEmpty()
  @Field(() => Int)
  amount: number;
  @Field(() => ID)
  @IsNotEmpty()
  userId: string;
  @Field(() => ID)
  @IsNotEmpty()
  loanTypeId: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  token?: string;
  processing: boolean;
  guarantor?: boolean;
  bankId: string;
  canWithdraw: boolean;
  amountRemaining?: number;
}
