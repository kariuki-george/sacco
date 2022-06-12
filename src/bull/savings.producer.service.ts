import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';

@Injectable()
export class SavingsProducerService {
  constructor(@InjectQueue('savings') private savingsQueue: Queue) {}
  async createDefaultSavingAccount(id: Types.ObjectId) {
    try {
      return this.savingsQueue.add('saving-creation', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createSaccoSavingAccount(id: Types.ObjectId) {
    try {
      return this.savingsQueue.add('saving-createSaccoSaving', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createNormalSavingAccount(id: Types.ObjectId) {
    try {
      return this.savingsQueue.add('saving-createNormalSaving', { id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async depositIntoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    return await this.savingsQueue.add(
      'saving-depositIntoSavingsAccount',
      {
        ...depositIntoSavingAccountDto,
      },
    );
  }

  async depositIntoSaccoSavingAccount(depositIntoSaccoSavingAccount:DepositIntoSavingAccountDto){
    return this.savingsQueue.add("savings-depositIntoSaccoSavingsAccount",{
      ...depositIntoSaccoSavingAccount
    })
  }
  
}
