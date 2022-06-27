import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankResolver } from './bank.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './entities/bank.entity';
import { BullQueueModule } from 'src/bull/bull.module';
import { SavingsConsumerService } from './consumers/savings.consumer';
import { AccountsConsumerService } from './consumers/accounts.cosumer';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { LoansConsumerService } from './consumers/loans.consumer';
import { BankController } from './bank.controller';

@Module({
  providers: [
    BankResolver,
    BankService,
    SavingsConsumerService,
    AccountsConsumerService,
    LoansConsumerService,
  ],
  imports: [
    MongooseModule.forFeature([
      {
        name: Bank.name,
        schema: BankSchema,
      },
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
    BullQueueModule,
  ],
  controllers:[BankController]
})
export class BankModule {}
