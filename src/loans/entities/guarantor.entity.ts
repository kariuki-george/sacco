import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Loan } from './loan.entity';

@Schema()
export class Guarantor {
  @Prop()
  amount: number;
  @Prop()
  token: string;
  @Prop()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Loan' })
  loanId: Loan
}
