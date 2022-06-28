import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BankService } from '../bank.service';

interface T{
  id: string;
}

@Processor('accounts')
export class AccountsConsumerService {
  constructor(private readonly bankService: BankService) {}

  @Process('account-created-CreateEscrow')
  async createEscrowBankAccount(job: Job<T>) {
    const { id } = job.data;
    

    return this.bankService.createEscrow(id);
  }
}
