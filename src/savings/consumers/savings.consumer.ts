import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { SavingsService } from '../savings.service';

interface savingsBankInterface {
  savingsId: string;
  bankId: string;
}

@Processor('savings')
export class SavingsConsumerService {
  constructor(private readonly savingsService: SavingsService) {}

  @Process('savingsBank-created')
  async savingsBankCreatedEvent(job: Job<savingsBankInterface>) {
    const { savingsId, bankId } = job.data;

    return this.savingsService.update(savingsId, { bankId });
  }
}
