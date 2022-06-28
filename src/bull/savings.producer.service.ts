import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';

import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';

@Injectable()
export class SavingsProducerService {
  constructor(@InjectQueue('savings') private savingsQueue: Queue) {}
  async createDefaultSavingAccount(id: string) {
    try {
      return this.savingsQueue.add('saving-creation', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createSaccoSavingAccount(id: string) {
    try {
      return this.savingsQueue.add('saving-createSaccoSaving', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createNormalSavingAccount(id: string) {
    try {
      return this.savingsQueue.add('saving-createNormalSaving', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async depositIntoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    return await this.savingsQueue.add('saving-depositIntoSavingsAccount', {
      ...depositIntoSavingAccountDto,
    });
  }

  depositIntoSaccoSavingAccount(
    depositIntoSaccoSavingAccount: DepositIntoSavingAccountDto,
  ) {
    return this.savingsQueue.add('saving-depositIntoSaccoSavingsAccount', {
      ...depositIntoSaccoSavingAccount,
    });
  }

  transferSavingsToEscrow(id: string) {
    return this.savingsQueue.add('saving-transferSavingsToEscrow', { id });
  }
}
