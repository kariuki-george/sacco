import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export enum bankType {
  SAVINGS = 'SAVINGS',
  ESCROW = 'ESCROW',
  DEFAULT_SAVINGS = 'DEFAULT_SAVINGS',
  MPESA = 'MPESA',
  LOAN = 'LOAN',
}

@Schema()
@ObjectType()
export class Bank {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => Boolean)
  @Prop({ type: Boolean, default: false })
  default: boolean;
  @Field(() => String)
  @Prop()
  type: bankType;
  @Field(() => Int)
  @Prop()
  amount: number;
  @Field(() => ID)
  @Prop()
  accountId: Types.ObjectId;
}

export type BankDocument = Bank & Document;

export const BankSchema = SchemaFactory.createForClass(Bank);
