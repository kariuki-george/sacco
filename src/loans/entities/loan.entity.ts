import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Loan {
  @Prop()
  @Field(() => Int)
  amount: number;
  @Prop()
  @Field(() => Int)
  amountPaid: number;
  @Field(() => ID)
  @Prop()
  userId: Types.ObjectId;
  @Field(() => ID)
  @Prop()
  loanTypeId: Types.ObjectId;
  @Field(() => Boolean)
  @Prop({ default: false })
  guarantor: boolean;

  @Prop({ default: false })
  @Field(() => Boolean)
  processing: boolean;
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;
}

export type LoanDocument = Loan & Document;

export const LoanSchema = SchemaFactory.createForClass(Loan);
