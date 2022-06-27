import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import  { Types } from 'mongoose';
import { bankType } from './bank.entity';

export enum transactionStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export enum transactionType {
  OUTDEPOSIT = 'OUTDEPOSIT',
  OUTWITHDRAW = 'OUTWITHDRAW',
  INDEPOSIT = 'INDEPOSIT',
  INWITHDRAW = 'INWITHDRAW',
}

@ObjectType()
@Schema()
export class Transaction {
  @Field(() => String)
  @Prop()
  type: transactionType;
  @Field(() => Int)
  @Prop()
  amount: number;
  @Field(() => String)
  @Prop()
  from: bankType;
  @Field(() => String)
  @Prop()
  to: bankType;
  @Field(() => ID)
  @Prop()
  toId: Types.ObjectId;
  @Field(() => ID)
  @Prop()
  fromId: Types.ObjectId;
  @Prop()
  @Field(() => String)
  status: transactionStatus;

  @Prop({ default: '-' })
  requestId: string;
  @Field(() => ID)
  @Prop()
  userId: Types.ObjectId;
}

export type TransactionDocument = Transaction & Document;

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
