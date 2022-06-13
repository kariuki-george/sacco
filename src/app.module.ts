import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BankModule } from './bank/bank.module';
import { LoansModule } from './loans/loans.module';
import { SavingsModule } from './savings/savings.module';
import { BullQueueModule } from './bull/bull.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    BullQueueModule,
    MongooseModule.forRoot('mongodb://localhost:27017/sacco'),
    UsersModule,
    BankModule,
    LoansModule,
    SavingsModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: 'src/schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
