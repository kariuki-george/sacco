import { InputType, Int, ID, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsPositive } from 'class-validator';
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
  @IsNotEmpty()
  token: string;
  processing: boolean;
  guarantor?: boolean;
}
