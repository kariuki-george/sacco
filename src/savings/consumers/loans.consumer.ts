import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { Savings } from '../entities/saving.entity';
import { SavingsService } from '../savings.service';

interface T {
  id: Types.ObjectId;
}

@Processor('loans')
export class LoansConsumerService {
  constructor(private readonly savingsService: SavingsService) {}

  @Process('guarantor-createCheck')
  async guarantorCreateChecks(job: Job<T>): Promise<Savings> {
    const { id } = job.data;

    return this.savingsService.validateGuarantor(id);
  }
}
