import { bankType } from '../entities/bank.entity';



export class CreateBankDto {
  default: boolean | false;

  type: bankType;

  amount: number | 0;

  accountId: string;
}
