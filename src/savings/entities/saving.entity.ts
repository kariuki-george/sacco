import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum savingsType {
  USER_SAVINGS = 'USER_SAVINGS',
  SACCO_SAVINGS = 'SACCO_SAVINGS',
}

@Schema()
@ObjectType()
export class Savings {
  @Field(() => ID)
  _id: Types.ObjectId;
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
  userId: Types.ObjectId;

  @Field(() => ID)
  @Prop()
  bankId: Types.ObjectId;
  @Prop({ type: Boolean, default: false })
  default?: boolean;

  @Field(() => Number)
  @Prop({ default: 0 })
  amountLoanable: number;
}

export type SavingsDocument = Savings & Document;

export const SavingsSchema = SchemaFactory.createForClass(Savings);
