import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AccountsProducerService } from './accounts.producer.service';
import { SavingsProducerService } from './savings.producer.service';
import { BanksProducerService } from './bank.producer.service';

@Module({
  providers: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
  ],
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'accounts',
      },
      {
        name: 'savings',
      },
      {
        name: 'banks',
      },
    ),
  ],
  exports: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
  ],
})
export class BullQueueModule {}
