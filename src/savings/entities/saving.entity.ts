import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Bank } from '../../bank/entities/bank.entity';
import { User } from '../../users/entities/user.entity';

@Schema()
export class Savings {
  @Prop()
  name: string;
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
