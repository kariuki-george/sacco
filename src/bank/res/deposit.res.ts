import { InputType, Field, ID, Int } from '@nestjs/graphql';


@InputType()
export class DepositDto {
  @Field(() => String)
  type: string;
  @Field(() => Int)
  amount: number;
  @Field(() => String)
  from: string;
  @Field(() => String)
  to: string;

  @Field(() => ID)
  userId: string;
  @Field(() => String)
  requestId?: string;
}
