import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';

@Injectable()
export class AccountsProducerService {
  constructor(@InjectQueue('accounts') private accountsQueue: Queue) {}

  async accountCreate(id: Types.ObjectId) {
   
    try {
      await this.accountsQueue.add('account-created', {
        id,
      });

      return id;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
