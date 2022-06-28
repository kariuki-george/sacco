import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

@InputType()
export class DepositDto {
  @IsNumber()
  @IsPositive()
  @Field(() => Int)
  amount: number;

  @IsNotEmpty()
  @Field(() => ID)
  userId: string;

  @Field(() => Int, { nullable: true })
  phoneNumber: number;
}
