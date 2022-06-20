import { Types } from 'mongoose';

export class TransferFundsDto {
  loanBankId: Types.ObjectId;
  guarantorUserId?: Types.ObjectId;
  userId?: Types.ObjectId;
  amount: number;
}
