import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export enum bankType {
  SAVINGS = 'SAVINGS',
  ESCROW = 'ESCROW',
  DEFAULT_SAVINGS = 'DEFAULT_SAVINGS',
}

@Schema()
@ObjectType()
export class Bank {
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
  accountId: mongoose.Schema.Types.ObjectId;
}

export type BankDocument = Bank & Document;

export const BankSchema = SchemaFactory.createForClass(Bank);
