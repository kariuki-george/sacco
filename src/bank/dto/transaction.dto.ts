import { Types } from 'mongoose';
import { bankType } from '../entities/bank.entity';
import {
  transactionStatus,
  transactionType,
} from '../entities/transaction.entity';

export class TransactionDto {
  amount: number;
  status: transactionStatus;
  type: transactionType;
  toId: Types.ObjectId;
  to: bankType;
  from: bankType;
  fromId: Types.ObjectId;
  receiptId?: string;
  userId: Types.ObjectId
}
