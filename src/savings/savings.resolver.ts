import { UseGuards } from '@nestjs/common';
import { SavingsService } from './savings.service';

import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { CreateNormalSavingDto } from './dto/createNormalSaving.dto';
import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { Savings } from './entities/saving.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';

@Resolver()
export class SavingsResolver {
  constructor(private readonly savingsService: SavingsService) {}

  @UseGuards(AdminAuthGuard)
  @Query(() => [Savings])
  getAllSavings(): Promise<Savings[]> {
    return this.savingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Savings)
  findOne(@Args('id') id: string): Promise<Savings> {
    return this.savingsService.findOne(new Types.ObjectId(id));
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => Int)
  getTotalSaving(): Promise<Number> {
    return this.savingsService.findTotalSavings();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Savings])
  getSavingsByUserId(@Args('id') id: string): Promise<Savings[]> {
    return this.savingsService.findAllByUserId(new Types.ObjectId(id));
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Savings)
  saveToCustomUserAccount(
    @Args('depositIntoSavingAccountDto')
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    return this.savingsService.depositIntoSavingAccount({
      ...depositIntoSavingAccountDto,
      userId: new Types.ObjectId(depositIntoSavingAccountDto.userId),
      savingsId: new Types.ObjectId(depositIntoSavingAccountDto.savingsId),
    });
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Savings)
  saveToSaccoAccount(
    @Args('depositIntoSavingAccountDto')
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    return this.savingsService.depositIntoSaccoSavingAccount({
      ...depositIntoSavingAccountDto,
      userId: new Types.ObjectId(depositIntoSavingAccountDto.userId),
      savingsId: new Types.ObjectId(depositIntoSavingAccountDto.savingsId),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Mutation(() => Savings)
  createSacco(@Args('id') id: string): Promise<Savings> {
    return this.savingsService.createSaccoSavingsAccount(
      new Types.ObjectId(id),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Savings)
  createNormalSavingsAccount(
    @Args('createNormalSaving') createNormalSaving: CreateNormalSavingDto,
  ): Promise<Savings> {
    return this.savingsService.createNormalSavingsAccount(createNormalSaving);
  }
}
