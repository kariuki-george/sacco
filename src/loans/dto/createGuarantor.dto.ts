import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';


@InputType()
export class CreateGuarantorDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: string;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Field(() => Int)
  amount: number;
  
}
