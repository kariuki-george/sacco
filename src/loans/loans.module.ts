import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansResolver } from './loans.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Loan, LoanSchema } from './entities/loan.entity';
import { LoanType, LoanTypeSchema } from './entities/loanType.entity';
import { Guarantor, GuarantorSchema } from './entities/guarantor.entity';
import { BullQueueModule } from 'src/bull/bull.module';

@Module({
  providers: [LoansService, LoansResolver],
  imports: [
    BullQueueModule,

    MongooseModule.forFeature([
      {
        name: Loan.name,
        schema: LoanSchema,
      },
      {
        name: LoanType.name,
        schema: LoanTypeSchema,
      },
      {
        name: Guarantor.name,
        schema: GuarantorSchema,
      },
    ]),
  ],
})
export class LoansModule {}
