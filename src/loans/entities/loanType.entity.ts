import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class LoanType {
  @Prop()
  name: string;
  @Prop()
  maxLoan: number;
  @Prop()
  interestRate: number;
  @Prop()
  dueDate: Date;
  @Prop({ type: Boolean, default: false })
  guarantor: boolean;
}

export type LoanTypeDocument = LoanType & Document;

export const LoanTypeSchema = SchemaFactory.createForClass(LoanType);
