import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { SavingsService } from './savings.service';

interface T {
  id: Types.ObjectId;
}
interface savingsBankInterface {
  savingsId: Types.ObjectId;
  bankId: Types.ObjectId;
}

@Processor('banks')
@Processor('accounts')
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
}
