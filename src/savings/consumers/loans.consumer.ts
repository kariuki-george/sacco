import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { FreezeSavingsDto } from 'src/savings/dto/freezeSavings.dto';
import { Savings } from '../entities/saving.entity';
import { SavingsService } from '../savings.service';

interface T {
  id: string;
}

@Processor('loans')
export class LoansConsumerService {
  constructor(private readonly savingsService: SavingsService) {}

  @Process('guarantor-createCheck')
  async guarantorCreateChecks(job: Job<T>): Promise<Savings> {
    const { id } = job.data;

    return this.savingsService.findOne(id);
  }
  @Process('saving-getSavings')
  async getSavings(job: Job<T>): Promise<Savings> {
    const { id } = job.data;
    return this.savingsService.findOne(id);
  }
  @Process('saving-freezeSavingsAccount')
  async freezeSavingsAccount(job: Job<FreezeSavingsDto>): Promise<Savings> {
    const { userId, amount } = job.data;

    return this.savingsService.freezeSavingsAccount({ userId, amount });
  }
}
