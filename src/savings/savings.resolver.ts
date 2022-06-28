import { UseGuards } from '@nestjs/common';
import { SavingsService } from './savings.service';


import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { CreateNormalSavingDto } from './dto/createNormalSaving.dto';
import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { Savings } from './entities/saving.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';
import { TransferSavingsToEscrowResponse} from './res/TransferSavings.res';

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
    return this.savingsService.findOne((id));
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => Int , {nullable:true})
  getTotalSavings(): Promise<Number> {
    return this.savingsService.findTotalSavings();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Savings])
  getSavingsByUserId(@Args('id') id: string): Promise<Savings[]> {
    return this.savingsService.findAllByUserId((id));
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Savings)
  saveToCustomUserAccount(
    @Args('depositIntoSavingAccountDto')
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    return this.savingsService.depositIntoSavingAccount({
      ...depositIntoSavingAccountDto,
      userId: (depositIntoSavingAccountDto.userId),
      savingsId: (depositIntoSavingAccountDto.savingsId),
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
      userId: (depositIntoSavingAccountDto.userId),
      savingsId: (depositIntoSavingAccountDto.savingsId),
    });
  }

  @UseGuards(AdminAuthGuard)
  @Mutation(() => Savings)
  createSacco(@Args('id') id: string): Promise<Savings> {
    return this.savingsService.createSaccoSavingsAccount(
      (id),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Savings)
  createNormalSavingsAccount(
    @Args('createNormalSaving') createNormalSaving: CreateNormalSavingDto,
  ): Promise<Savings> {
    return this.savingsService.createNormalSavingsAccount(createNormalSaving);
  }
  

  @UseGuards(JwtAuthGuard)
  @Mutation(()=>TransferSavingsToEscrowResponse)
  transferSavingsToEscrow(@Args("savingsId") id:string): Promise<TransferSavingsToEscrowResponse>{
    return this.savingsService.transferSavingsToEscrow(id)
  }
}
