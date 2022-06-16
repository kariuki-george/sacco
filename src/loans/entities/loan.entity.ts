import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
export class Loan {
  @Prop()
  amount: number;
  @Prop()
  amountPaid: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;
  @Prop()
  loanTypeId: Types.ObjectId;
  @Prop({ default: false })
  guarantor: boolean;
  @Prop()
  guarantorId?: Types.ObjectId;
}

export type LoanDocument = Loan & Document;

export const LoanSchema = SchemaFactory.createForClass(Loan);
