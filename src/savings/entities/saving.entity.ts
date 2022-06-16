import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export enum savingsType {
  USER_SAVINGS = 'USER_SAVINGS',
  SACCO_SAVINGS = 'SACCO_SAVINGS',
}

@Schema()
@ObjectType()
export class Savings {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => String)
  @Prop()
  name: string;
  @Prop()
  @Field(() => String)
  type: savingsType;
  @Prop()
  @Field(() => Int)
  amountSaved: number;
  @Prop()
  @Field(() => Int)
  amountAimed: number;
  @Field(() => Boolean)
  @Prop({
    type: Boolean,
    default: false,
  })
  frozen: boolean;
  @Field(() => ID)
  @Prop({ type: Types.ObjectId })
  userId: mongoose.Schema.Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId })
  bankId: Types.ObjectId;
  @Prop({ type: Boolean, default: false })
  default?: boolean;
}

export type SavingsDocument = Savings & Document;

export const SavingsSchema = SchemaFactory.createForClass(Savings);
