import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { SavingsModule } from 'src/savings/savings.module';
import { BankModule } from 'src/bank/bank.module';
import { BullQueueModule } from 'src/bull/bull.module';

@Module({
 
  providers: [UsersService, UsersResolver],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SavingsModule, BankModule, BullQueueModule
  ],
  exports:[
    UsersService
  ]
})
export class UsersModule {}
