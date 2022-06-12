import { Process, Processor } from '@nestjs/bull';
import { Types } from 'mongoose';
import { SavingsService } from '../savings.service';
import { Job } from 'bull';

interface T {
  id: Types.ObjectId;
}
@Processor('accounts')
export class AccountsSavingsConsumerService {
  constructor(private readonly savingsService: SavingsService) {}

  @Process('account-created')
  async createDefaultSavingAccount(job: Job<T>) {
    const { id } = job.data;
    return this.savingsService.createDefaultSavingsAccount(id);
  }
}
