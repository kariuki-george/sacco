import { Types } from 'mongoose';

export class CreateNormalSavingDto {
  userId: Types.ObjectId;
  amountAimed?: number | 0;
  name: string;
}
