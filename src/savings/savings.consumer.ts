import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { SavingsService } from './savings.service';

interface T {
  id: Types.ObjectId;
}
interface savingsBankInterface {
  savingsId: Types.ObjectId;
  bankId: Types.ObjectId;
}

@Processor('accounts')
@Processor('savings')
@Processor('banks')
export class SavingsConsumerService {
  constructor(private readonly savingsService: SavingsService) {}
  @Process('account-created')
  async accountCreatedEvent(job: Job<T>) {
    const { id } = job.data;
    
    return this.savingsService.createDefaultSavingsAccount(id);
  }
  @Process('savingsBank-created')
  async savingsBankCreatedEvent(job: Job<savingsBankInterface>) {
    const { savingsId, bankId } = job.data;

    return this.savingsService.update(savingsId, { bankId });
  }

  @Process('bank-InWithdrawInitiated')
  async depositIntoSavingsAccount(job: Job<DepositIntoSavingAccountDto>) {
    const { amount, bankId, savingsId, userId } = job.data;

    return this.savingsService.depositIntoSavingAccountUpdate({
      amount,
      bankId,
      savingsId,
      userId,
    });
  }
}
