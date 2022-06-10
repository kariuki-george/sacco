import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';

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
}
