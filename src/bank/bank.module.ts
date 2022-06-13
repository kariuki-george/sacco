import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankResolver } from './bank.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './entities/bank.entity';
import { BullQueueModule } from 'src/bull/bull.module';
import { SavingsConsumerService } from './consumers/savings.consumer';
import { AccountsConsumerService } from './consumers/accounts.savings';

@Module({

  providers: [BankResolver,BankService, SavingsConsumerService, AccountsConsumerService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Bank.name,
        schema: BankSchema,
      },
    ]),
    BullQueueModule,
  ],
  exports: [BankService],
})
export class BankModule {}
