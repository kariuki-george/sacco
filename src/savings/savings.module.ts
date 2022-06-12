import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Savings, SavingsSchema } from './entities/saving.entity';

import { BankModule } from 'src/bank/bank.module';
import { BullQueueModule } from 'src/bull/bull.module';
import { SavingsConsumerService } from './consumers/savings.consumer';
import { AccountsSavingsConsumerService } from './consumers/account.consumer';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService, SavingsConsumerService, AccountsSavingsConsumerService],
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
