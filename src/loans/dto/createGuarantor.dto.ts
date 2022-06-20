import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateGuarantorDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: Types.ObjectId;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Field(() => Int)
  amount: number;
  
}
