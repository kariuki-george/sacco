import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BankService } from './bank.service';
import { Bank } from './entities/bank.entity';

@Resolver('banks')
export class BankResolver {
  constructor(private readonly bankService: BankService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => Bank)
  async getEscrow(@Args('userId') id: string): Promise<Bank> {
    return this.bankService.findEscrow(new Types.ObjectId(id));
  }
}
