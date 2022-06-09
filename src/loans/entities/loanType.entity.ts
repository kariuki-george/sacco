import { Prop, Schema } from '@nestjs/mongoose';

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
