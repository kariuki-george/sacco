import { Types } from 'mongoose';

export class DepositIntoSavingAccountDto {
  userId: Types.ObjectId ;
  amount: number;
  savingsId: Types.ObjectId ;
  bankId: Types.ObjectId;
}
