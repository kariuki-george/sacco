import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';
import { BankService } from '../bank.service';

interface T {
  id: Types.ObjectId;
}

@Processor('savings')
export class SavingsConsumerService {
  constructor(private readonly bankService: BankService) {}

  @Process('saving-creation')
  async createSavingBankAccount(job: Job<T>) {
    const { id } = job.data;

    const bank = await this.bankService.createSavingsBankAccount(id);
    return bank;
  }

  @Process('saving-depositIntoSavingsAccount')
  async depositIntoSavingsAccountInitiated(
    job: Job<DepositIntoSavingAccountDto>,
  ) {
    return this.bankService.inWithDraw({
      ...job.data,
      loanId: null,
    });
  }

  @Process('saving-createSaccoSaving')
  async createSaccoSavingBankAccount(job: Job<T>) {
    const { id } = job.data;
    return this.bankService.createSaccoSavingBankAccount(id);
  }

  @Process('saving-createNormalSaving')
  async createNormalSavingBankAccount(job: Job<T>) {
    const { id } = job.data;

    return this.bankService.createNormalSavingBankAccount(id);
  }

  @Process("saving-depositIntoSaccoSavingsAccount")
  async depositIntoSaccoBankAccount(depositIntoSaccoBankAccount:Job<DepositIntoSavingAccountDto>){
    return this.bankService.depositIntoSaccoBankAccount(depositIntoSaccoBankAccount.data)

  }
}
