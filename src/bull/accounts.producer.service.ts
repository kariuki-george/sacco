import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';

@Injectable()
export class AccountsProducerService {
  constructor(@InjectQueue('accounts') private accountsQueue: Queue) {}

  async accountCreate(id: Types.ObjectId) {
    try {
      const EscrowBankAccount = await this.accountsQueue.add(
        'account-created-CreateEscrow',
        {
          id,
        },
      );
      const savingsAccount = await this.accountsQueue.add('account-created', {
        id,
      });

      return {
        EscrowBankAccount,
        savingsAccount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
