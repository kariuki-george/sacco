import { Types } from 'mongoose';
export  class FreezeSavingsDto {
  userId: Types.ObjectId;
  amount: number;
}
