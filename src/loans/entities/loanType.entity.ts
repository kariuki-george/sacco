import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema()
export class LoanType {
  @Field(() => String)
  @Prop({ unique: true })
  
  name: string;
  @Prop()
  @Field(() => Int, {
    description:
      'This is a percentage for loans savings...eg, 90 means 90% total savings.',
  })
  maxLoan: number;
  @Field(() => Int, { description: 'Interest rate in percentage.' })
  @Prop({})
  interestRate: number;
  @Field(() => Int, {
    description: 'This is number of months required to repay the loan.',
  })
  @Prop()
  repayPeriod: number;
  @Field(() => Boolean)
  @Prop({ type: Boolean, default: false })
  guarantor: boolean;
  @Field(()=>ID)
  _id:Types.ObjectId
}

export type LoanTypeDocument = LoanType & Document;

export const LoanTypeSchema = SchemaFactory.createForClass(LoanType);
