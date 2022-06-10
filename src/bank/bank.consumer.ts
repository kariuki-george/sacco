import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';
import { BankService } from './bank.service';

interface T {
  id: Types.ObjectId;
}

@Processor('savings')
export class BanksConsumerService {
  constructor(private readonly bankService: BankService) {}

  @Process('saving-created')
  async createSavingBankForNewSavingsAccount(job: Job<T>) {
    const { id } = job.data;
    await this.bankService.createForNewSavingsEvent(id);
    return id;
  }

  @Process('saving-depositIntoSavingsAccountInitiated')
  async depositIntoSavingsAccountInitiated(
    job: Job<DepositIntoSavingAccountDto>,
  ) {
    await this.bankService.inWithDraw({
      ...job.data,
      loanId: null,
    });
    return job.data;
  }
  @Process('saving-depositIntoSavingsAccountCompleted')
  async despositIntoSavingsAccountCompleted(
    job: Job<DepositIntoSavingAccountDto>,
  ) {
    const { bankId, amount } = job.data;
    await this.bankService.update(bankId, { amount });
  }
}
