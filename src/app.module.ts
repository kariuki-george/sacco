import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BankModule } from './bank/bank.module';
import { LoansModule } from './loans/loans.module';
import { SavingsModule } from './savings/savings.module';
import { BullQueueModule } from './bull/bull.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullQueueModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<String>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BankModule,
    LoansModule,
    SavingsModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      plugins:[ApolloServerPluginLandingPageLocalDefault],
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      introspection: true,

      context: ({ req, res }) => ({ req, res }),
    }),
    CacheModule.register({
      isGlobal:true
    }),
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
