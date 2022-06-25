import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class PayLoanDto {
  @Field(() => ID)
  @IsNotEmpty()
  loanId: Types.ObjectId;
  @Field(() => Number)
  @IsPositive()
  amount: number;
}
