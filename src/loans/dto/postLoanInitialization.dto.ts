import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';


@InputType()
export class PostLoanInitializationDto {
  @Field(() => ID)
  @IsNotEmpty()
  loanId: string;
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  token: string;
}
