import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';


@InputType()
export class CreateNormalSavingDto {
  @Field(() => ID)
  @IsNotEmpty()
  userId: string;
  @IsNumber()
  @Field(() => Int)
  amountAimed?: number | 0;
  @IsNotEmpty()
  @Field()
  name: string;
}
