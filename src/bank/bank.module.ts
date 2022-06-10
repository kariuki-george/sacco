import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './entities/bank.entity';
import { BanksConsumerService } from './bank.consumer';
import { BullQueueModule } from 'src/bull/bull.module';


@Module({
  controllers: [BankController],
  providers: [BankService, BanksConsumerService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Bank.name,
        schema: BankSchema,
      },
    ]),
    BullQueueModule
  ],
  exports: [BankService],
})
export class BankModule {}
