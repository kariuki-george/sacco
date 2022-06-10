import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
export class Bank {
  @Prop({ type: Boolean, default: false })
  default: boolean;
  @Prop()
  type: string;
  @Prop()
  amount: number;
  @Prop()
  accountId: Types.ObjectId;
}

export type BankDocument = Bank & Document;

export const BankSchema = SchemaFactory.createForClass(Bank);
