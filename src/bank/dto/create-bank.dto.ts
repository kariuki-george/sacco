import { Types } from 'mongoose';

export class CreateBankDto {
  default: boolean | false;

  type: string;

  amount: number | 0;

  accountId: Types.ObjectId;
}
