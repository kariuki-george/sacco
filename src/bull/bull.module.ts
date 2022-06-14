import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AccountsProducerService } from './accounts.producer.service';
import { SavingsProducerService } from './savings.producer.service';
import { BanksProducerService } from './bank.producer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
  ],
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
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
    ),
  ],
  exports: [
    AccountsProducerService,
    SavingsProducerService,
    BanksProducerService,
  ],
})
export class BullQueueModule {}
