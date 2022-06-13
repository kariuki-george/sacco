import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateNormalSavingDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: Types.ObjectId;
  @IsNumber()
  @Field(() => Int)
  amountAimed?: number | 0;
  @IsNotEmpty()
  @Field()
  name: string;
}
