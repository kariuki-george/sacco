import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Guarantor {
  @Prop()
  @Field(() => Int)
  amount: number;
  @Field(() => String)
  @Prop()
  token: string;
  @Field(() => ID)
  @Prop()
  userId: Types.ObjectId;
  @Field(() => ID)
  @Prop()
  loanId?: Types.ObjectId;
}

export type GuarantorDocument = Guarantor & Document;

export const GuarantorSchema = SchemaFactory.createForClass(Guarantor);
