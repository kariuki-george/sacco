import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class PostLoanInitializationDto {
  @Field(() => ID)
  @IsNotEmpty()
  loanId: Types.ObjectId;
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  token: string;
}
