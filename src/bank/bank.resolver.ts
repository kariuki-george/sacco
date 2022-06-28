import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BankService } from './bank.service';
import { DepositDto } from './dto/deposit.dto';
import { Bank } from './entities/bank.entity';
import { Transaction } from './entities/transaction.entity';

@Resolver('banks')
export class BankResolver {
  constructor(private readonly bankService: BankService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => Bank)
  getEscrow(@Args('userId') id: string): Promise<Bank> {
    console.log(id);
    return this.bankService.findEscrow(id);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Bank)
  outDeposit(@Args('outDeposit') outDeposit: DepositDto): Promise<Bank> {
    return this.bankService.outDeposit({
      ...outDeposit,
      userId: outDeposit.userId,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => [Transaction])
  getUserTransactions(@Args('userId') id: string): Promise<Transaction[]> {
    return this.bankService.getUserTransactions(id);
  }
}
