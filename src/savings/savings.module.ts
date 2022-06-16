import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsResolver } from './savings.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Savings, SavingsSchema } from './entities/saving.entity';

import { BankModule } from 'src/bank/bank.module';
import { BullQueueModule } from 'src/bull/bull.module';
import { SavingsConsumerService } from './consumers/savings.consumer';
import { AccountsSavingsConsumerService } from './consumers/account.consumer';
import { LoansConsumerService } from './consumers/loans.consumer';

@Module({
 
  providers: [SavingsResolver,SavingsService, SavingsConsumerService, AccountsSavingsConsumerService, LoansConsumerService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Savings.name,
        schema: SavingsSchema,
      },
    ]),
    BankModule,
    BullQueueModule,
  ],
  exports: [SavingsService],
})
export class SavingsModule {}
