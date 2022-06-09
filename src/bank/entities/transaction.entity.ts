import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Transaction {
  @Prop()
  type: string;
  @Prop()
  amount: number;
  @Prop()
  from: string;
  @Prop()
  to: string;
  @Prop()
  toId: mongoose.Schema.Types.ObjectId;
  @Prop()
  fromId: mongoose.Schema.Types.ObjectId;
}
