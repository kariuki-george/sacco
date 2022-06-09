import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BankModule } from './bank/bank.module';
import { LoansModule } from './loans/loans.module';
import { SavingsModule } from './savings/savings.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/sacco'),
    UsersModule,
    BankModule,
    LoansModule,
    SavingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
