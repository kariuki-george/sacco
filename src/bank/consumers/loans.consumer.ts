import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { TransferFundsDto } from 'src/loans/dto/transferFunds.dto';
import { BankService } from '../bank.service';
import { Bank } from '../entities/bank.entity';

interface T {
  id: Types.ObjectId;
}

@Processor('loans')
export class LoansConsumerService {
  constructor(private readonly bankService: BankService) {}

  @Process('bank-createLoanBank')
  async createLoanBank(job: Job<T>): Promise<Bank> {
    const { id } = job.data;

    return this.bankService.createLoanBank(id);
  }
  @Process('bank-transferFunds')
  async transferFunds(job: Job<TransferFundsDto>): Promise<Bank> {
    return this.bankService.transferFunds({ ...job.data });
  }
}
