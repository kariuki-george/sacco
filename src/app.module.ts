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

import { GraphQLFormattedError } from 'graphql/error';

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
      //plugins: [ApolloServerPluginLandingPageLocalDefault],
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      introspection: true,

      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        if (error.message === 'VALIDATION_ERROR') {
          const extensions = {
            code: 'VALIDATION_ERROR',
            errors: [],
          };
          Object.keys(error.extensions.invalidArgs).forEach((key) => {
            const constraints = [];
            Object.keys(error.extensions.invalidArgs[key].constraints).forEach(
              (_key) => {
                constraints.push(
                  error.extensions.invalidArgs[key].constraints[_key],
                );
              },
            );

            extensions.errors.push({
              field: error.extensions.invlidArgs[key].property,
              errors: constraints,
            });
          });
          const graphQlFormattedError: GraphQLFormattedError = {
            message: 'Validation_Error',
            extensions,
          };
          return graphQlFormattedError;
        } else {
          return error;
        }
      },
    }),
    CacheModule.register({
      isGlobal: true,
    }),
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
