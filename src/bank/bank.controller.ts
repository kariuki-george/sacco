import { Body, Controller, Post } from '@nestjs/common';
import { BankService } from './bank.service';

@Controller('/bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}
  @Post('outdeposit')
  outDeposit(@Body() outDeposit) {
    return this.bankService.mpesaDeposit(outDeposit);
  }
  @Post('/mpesa/callback')
  mpesaCallBack(@Body() callBack) {
    this.bankService.mpesaCallback(callBack)
  }
}
