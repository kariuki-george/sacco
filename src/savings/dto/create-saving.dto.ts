import { Types } from 'mongoose';

export class CreateSavingDto {
  name: string;

  amountSaved: number;

  amountAimed: number | 0;

  frozen: boolean;

  userId: Types.ObjectId;
  bankId: Types.ObjectId | null;
}
