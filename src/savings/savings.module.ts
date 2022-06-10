import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Savings, SavingsSchema } from './entities/saving.entity';
import { SavingsConsumerService } from './savings.consumer';
import { BankModule } from 'src/bank/bank.module';
import { BullQueueModule } from 'src/bull/bull.module';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService, SavingsConsumerService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Savings.name,
        schema: SavingsSchema,
      },
    ]),
    BankModule,
    BullQueueModule
  ],
  exports: [SavingsService],
})
export class SavingsModule {}
