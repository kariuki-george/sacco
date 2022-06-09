import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
export class Bank {
  @Prop()
  default: {
    type: boolean;
    default: false;
  };
  @Prop()
  type: string;
  @Prop()
  amount: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  accountId: User;
}
