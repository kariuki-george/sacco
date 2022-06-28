import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';


@InputType()
export class DepositIntoSavingAccountDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: string;
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
  @Field(() => ID)
  @IsNotEmpty()
  savingsId: string;
  @Field(() => ID, { nullable: true })
  bankId: string;
}
