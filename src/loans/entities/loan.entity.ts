import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@ObjectType()
@Schema({ timestamps: true })
export class Loan {
  @Prop()
  @Field(() => Number)
  amount: number;
  @Prop({ default: 0 })
  @Field(() => Int)
  amountPaid: number;
  @Field(() => ID)
  @Prop()
  userId: string;
  @Field(() => ID)
  @Prop()
  loanTypeId: string;
  @Field(() => Boolean)
  @Prop({ default: false })
  guarantor: boolean;

  @Prop({ default: false })
  @Field(() => Boolean)
  processing: boolean;
  @Field(() => ID)
  _id: string;
  @Prop()
  bankId: string;
  @Field(() => Boolean)
  @Prop({ default: false })
  canWithdraw: boolean;
  @Field(() => Number)
  @Prop({ default: 0 })
  amountRemaining: number;
}

export type LoanDocument = Loan & Document;

export const LoanSchema = SchemaFactory.createForClass(Loan);
