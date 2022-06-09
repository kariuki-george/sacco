import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService]
})
export class SavingsModule {}
