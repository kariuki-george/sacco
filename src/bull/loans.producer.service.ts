import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { PayLoanDto } from 'src/loans/dto/payLoan.dto';
import { TransferFundsDto } from 'src/loans/dto/transferFunds.dto';
import { FreezeSavingsDto } from 'src/savings/dto/freezeSavings.dto';

@Injectable()
export class LoansProducerService {
  constructor(@InjectQueue('loans') private loansQueue: Queue) {}

  guarantorCreateChecks(id: string) {
    return this.loansQueue.add('guarantor-createCheck', {
      id,
    });
  }
  getSavings(id: string) {
    return this.loansQueue.add('saving-getSavings', { id });
  }
  createLoanBank(id: string) {
    return this.loansQueue.add('bank-createLoanBank', { id });
  }
  freezeSavingsAccount(freezeSavings: FreezeSavingsDto) {
    return this.loansQueue.add('saving-freezeSavingsAccount', freezeSavings);
  }
  transferFunds(transferFunds: TransferFundsDto) {
    return this.loansQueue.add('bank-transferFunds', transferFunds);
  }
  transferLoanToEscrow(id: string) {
    return this.loansQueue.add('bank-transferLoanToEscrow', { id });
  }
  payloan(payLoan: PayLoanDto){
    return this.loansQueue.add("bank-payLoan", payLoan)
  }
}
