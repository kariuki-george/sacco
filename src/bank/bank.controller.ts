import { Body, Controller, Post } from '@nestjs/common';
import { BankService } from './bank.service';

@Controller('/bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}
  @Post('outdeposit')
  outDeposit(@Body() outDeposit) {
    return this.bankService.mpesaDeposit(outDeposit);
  }
  @Post('outwithdraw')
  outWithdraw(@Body() outWithdraw) {
    return this.bankService.mpesaWithdraw(outWithdraw);
  }
  @Post('/mpesa/callback')
  mpesaCallBack(@Body() callBack) {
    this.bankService.mpesaCallback(callBack)
  }
  @Post('/mpesa/withdraw/result')
  mpesaWithdrawResult(@Body() callBack) {
    
    const conversationID = callBack.Result.ConversationID
    this.bankService.mpesaWithdrawUpdateEscrow(conversationID)
  }
  @Post('/mpesa/withdraw/queue')
  mpesaWithdrawQueue(@Body() callBack) {
    
  }
}
