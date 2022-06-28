import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';


@Injectable()
export class AccountsProducerService {
  constructor(@InjectQueue('accounts') private accountsQueue: Queue) {}

  async accountCreate(id: string) {
  
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
