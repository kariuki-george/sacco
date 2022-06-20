import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

@InputType()
export class CreateLoanTypeDto {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Field(() => Int, {
    description:
      'This is a percentage for loans savings...eg, 90 means 90% total savings.',
  })
  maxLoan: number;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Field(() => Int, { description: 'Interest rate in percentage.' })
  interestRate: number;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Field(() => Int, {
    description: 'This is number of months required to repay the loan.',
  })
  repayPeriod: number;
  @Field(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  guarantor: boolean;
}
