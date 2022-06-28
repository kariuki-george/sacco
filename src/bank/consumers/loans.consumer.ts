import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PayLoanDto } from 'src/loans/dto/payLoan.dto';
import { TransferFundsDto } from 'src/loans/dto/transferFunds.dto';
import { BankService } from '../bank.service';
import { Bank } from '../entities/bank.entity';

interface T {
  id: string;
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
  @Process("bank-transferLoanToEscrow")
  transferLoanToEscrow(job:Job<T>):Promise<Bank>{
    const {id} = job.data
    return this.bankService.transferLoanToEscrow(id)

  }
  @Process("bank-payLoan")
  payLoan(job:Job<PayLoanDto>):Promise<Bank>{
    
    return this.bankService.payLoan(job.data)

  }
}
