import { bankType } from '../entities/bank.entity';
import {
  transactionStatus,
  transactionType,
} from '../entities/transaction.entity';

export class TransactionDto {
  amount: number;
  status: transactionStatus;
  type: transactionType;
  toId: string;
  to: bankType;
  from: bankType;
  fromId: string;
  receiptId?: string;
  userId: string
}
