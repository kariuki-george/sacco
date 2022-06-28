import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum savingsType {
  USER_SAVINGS = 'USER_SAVINGS',
  SACCO_SAVINGS = 'SACCO_SAVINGS',
}

@Schema()
@ObjectType()
export class Savings {
  @Field(() => ID)
  _id: string;
  @Field(() => String)
  @Prop()
  name: string;
  @Prop()
  @Field(() => String)
  type: savingsType;
  @Prop()
  @Field(() => Int)
  amountSaved: number;
  @Prop()
  @Field(() => Int)
  amountAimed: number;
  @Field(() => Boolean)
  @Prop({
    type: Boolean,
    default: false,
  })
  frozen: boolean;
  @Field(() => ID)
  @Prop()
  userId: string;

  @Field(() => ID)
  @Prop()
  bankId: string;
  @Prop({ type: Boolean, default: false })
  default?: boolean;

  @Field(() => Number)
  @Prop({ default: 0 })
  amountLoanable: number;
}

export type SavingsDocument = Savings & Document;

export const SavingsSchema = SchemaFactory.createForClass(Savings);
