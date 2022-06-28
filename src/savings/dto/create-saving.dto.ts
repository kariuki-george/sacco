import { savingsType } from '../entities/saving.entity';

export class CreateSavingDto {
  name: string;
  type: savingsType;
  amountSaved: number;

  amountAimed: number | 0;

  frozen: boolean;

  userId: string;
  bankId: string | null;
  default?: boolean;
}
