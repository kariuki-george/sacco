import { Types } from 'mongoose';
import { bankType } from '../entities/bank.entity';



export class CreateBankDto {
  default: boolean | false;

  type: bankType;

  amount: number | 0;

  accountId: Types.ObjectId;
}
