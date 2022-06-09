import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Savings, SavingsSchema } from './entities/saving.entity';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Savings.name,
        schema: SavingsSchema,
      },
    ]),
  ],
  exports: [SavingsService],
})
export class SavingsModule {}
