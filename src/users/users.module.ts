import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { SavingsModule } from 'src/savings/savings.module';
import { BankModule } from 'src/bank/bank.module';
import { BullQueueModule } from 'src/bull/bull.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SavingsModule, BankModule, BullQueueModule
  ],
})
export class UsersModule {}
