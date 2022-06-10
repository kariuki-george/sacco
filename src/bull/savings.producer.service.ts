import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';

@Injectable()
export class SavingsProducerService {
  constructor(@InjectQueue('savings') private savingsQueue: Queue) {}
  async savingCreate(id: Types.ObjectId) {
    try {
      await this.savingsQueue.add('saving-created', { id });
      return id;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async depositIntoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    try {
      
      await this.savingsQueue.add('saving-depositIntoSavingsAccountInitiated', {
        ...depositIntoSavingAccountDto
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async depositIntoSavingAccountComplete(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    try {
      await this.savingsQueue.add('saving-depositIntoSavingsAccountCompleted', {
        depositIntoSavingAccountDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
