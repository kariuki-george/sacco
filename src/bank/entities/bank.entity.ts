import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export enum bankType {
  SAVINGS = 'SAVINGS',
  ESCROW = 'ESCROW',
  DEFAULT_SAVINGS = 'DEFAULT_SAVINGS',
}

@Schema()
export class Bank {
  @Prop({ type: Boolean, default: false })
  default: boolean;
  @Prop()
  type: bankType;
  @Prop()
  amount: number;
  @Prop()
  accountId: mongoose.Schema.Types.ObjectId;
}

export type BankDocument = Bank & Document;

export const BankSchema = SchemaFactory.createForClass(Bank);
