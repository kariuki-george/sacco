import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';

import { InWithDrawDto } from 'src/bank/dto/inWithdraw.dto';

@Injectable()
export class BanksProducerService {
  constructor(@InjectQueue('banks') private bankQueue: Queue) {}

  async newSavingsBank(bankId: string, savingsId: string) {
    try {
      await this.bankQueue.add('savingsBank-created', {
        bankId,
        savingsId,
      });
      return { bankId, savingsId };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async newBankInWithdrawal(inWithDraw: InWithDrawDto) {
    try {
      const { amount, bankId, savingsId, userId } = inWithDraw;
     
      
      await this.bankQueue.add('bank-InWithdrawInitiated', {
        amount,
        bankId,
        savingsId,
        userId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
