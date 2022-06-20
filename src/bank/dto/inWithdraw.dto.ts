import mongoose, { Types } from 'mongoose';

export class InWithDrawDto {
  userId: Types.ObjectId;
  amount: number;
  loanId: Types.ObjectId | null;
  savingsId: Types.ObjectId | null;
  bankId?: mongoose.Schema.Types.ObjectId ;
}
