import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export enum savingsType {
  USER_SAVINGS = 'USER_SAVINGS',
  SACCO_SAVINGS = 'SACCO_SAVINGS',
}

@Schema()
export class Savings {
  @Prop()
  name: string;
  @Prop()
  type: savingsType;
  @Prop()
  amountSaved: number;
  @Prop()
  amountAimed: number;
  @Prop({
    type: Boolean,
    default: false,
  })
  frozen: boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;
  @Prop()
  bankId: Types.ObjectId;
}

export type SavingsDocument = Savings & Document;

export const SavingsSchema = SchemaFactory.createForClass(Savings);
