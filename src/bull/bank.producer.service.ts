import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';

@Injectable()
export class BanksProducerService {
  constructor(@InjectQueue('banks') private bankQueue: Queue) {}

  async newSavingsBank(bankId: Types.ObjectId,savingsId: Types.ObjectId) {
    try {
      await this.bankQueue.add('savingsBank-created', {
        bankId, savingsId
      });
      return {bankId, savingsId};
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
