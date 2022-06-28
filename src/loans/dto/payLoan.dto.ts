import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsPositive } from 'class-validator';


@InputType()
export class PayLoanDto {
  @Field(() => ID)
  @IsNotEmpty()
  loanId: string;
  @Field(() => Number)
  @IsPositive()
  amount: number;
}
