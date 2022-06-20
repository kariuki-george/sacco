import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AccountsProducerService } from './accounts.producer.service';
import { SavingsProducerService } from './savings.producer.service';
import { BanksProducerService } from './bank.producer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoansProducerService } from './loans.producer.service';

@Module({
  providers: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
    LoansProducerService
  ],
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(+configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
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
      {
        name: 'loans',
      },
    ),
  ],
  exports: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
    LoansProducerService
  ],
})
export class BullQueueModule {}
