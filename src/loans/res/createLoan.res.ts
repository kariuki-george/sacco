import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Loan } from '../entities/loan.entity';

export enum TokenValidationStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

@ObjectType()
export class Token {
  @Field(() => String)
  status: TokenValidationStatus;
  @Field(() => String)
  token: string;
}

@ObjectType()
export class CreateLoanResponse {
  @Field(() => Loan, { nullable: true })
  loan: Loan;
  @Field(() => [Token], { nullable: true })
  token?: Token[];
  @Field(() => String)
  message: string;
  @Field(() => Number, {
    description: 'Amount remaining for guarantors to guarantee',
    nullable: true,
  })
  amountRemaining?: number;
}
