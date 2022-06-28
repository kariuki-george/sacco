import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Cache } from 'cache-manager';

import { Model, Types } from 'mongoose';
import { PayLoanDto } from 'src/loans/dto/payLoan.dto';
import { TransferFundsDto } from 'src/loans/dto/transferFunds.dto';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { DepositDto } from './dto/deposit.dto';
import { InWithDrawDto } from './dto/inWithdraw.dto';
import { TransactionDto } from './dto/transaction.dto';
import { Bank, bankType } from './entities/bank.entity';
import {
  Transaction,
  transactionStatus,
  transactionType,
} from './entities/transaction.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectModel(Bank.name) private bankRepo: Model<Bank>,
    @InjectModel(Transaction.name) private transactionRepo: Model<Transaction>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}
  create(createBankDto: CreateBankDto) {
    const newBank = new this.bankRepo(createBankDto);

    return newBank.save();
  }

  async createSavingsBankAccount(id: string) {
    const newBank: CreateBankDto = {
      accountId: id,
      amount: 0,
      type: bankType.DEFAULT_SAVINGS,
      default: false,
    };
    try {
      const bank = await this.create(newBank);
      return bank;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createEscrow(id: string) {
    return await this.create({
      accountId: id,
      amount: 0,
      default: false,
      type: bankType.ESCROW,
    });
  }

  async createSaccoSavingBankAccount(id: string) {
    return await this.create({
      accountId: id,
      amount: 0,
      default: true,
      type: bankType.DEFAULT_SAVINGS,
    });
  }

  async createNormalSavingBankAccount(id: string) {
    return await this.create({
      accountId: id,
      amount: 0,
      default: false,
      type: bankType.SAVINGS,
    });
  }

  async withdraw(inWithDraw: InWithDrawDto) {
    try {
      //Get escrow and check if current amount is enough for any withdraw
      const bank = await this.bankRepo.findOne({
        accountId: inWithDraw.userId,
        type: bankType.ESCROW,
      });

      if (bank.amount < inWithDraw.amount) {
        throw new BadRequestException({
          message: `Your Escrow account is less than ${inWithDraw.amount}`,
        });
      }

      //If amount is enough, update the escrow bank account
      return this.bankRepo.findByIdAndUpdate(bank._id, {
        $set: {
          amount: bank.amount - inWithDraw.amount,
        },
      });
    } catch (error) {
      if (error.response.status === 400) {
        throw new BadRequestException(error.response.message);
      }

      throw new InternalServerErrorException(error);
    }
  }

  async depositIntoSaccoBankAccount(
    depositIntoSaccoBankAccount: DepositIntoSavingAccountDto,
  ) {
    //get saccoBank, deposit then return the bank
    const escrow = await this.bankRepo.findOne({
      accountId: depositIntoSaccoBankAccount.userId,
      type: bankType.ESCROW,
    });

    try {
      //deposit
      const bank = await this.bankRepo.findOneAndUpdate(
        {
          type: bankType.DEFAULT_SAVINGS,
          default: true,
        },
        {
          $inc: {
            amount: depositIntoSaccoBankAccount.amount,
          },
        },
      );

      //save transaction
      await this.transaction({
        amount: depositIntoSaccoBankAccount.amount,
        from: bankType.ESCROW,
        to: bankType.DEFAULT_SAVINGS,
        toId: bank._id,
        fromId: escrow._id,
        type: transactionType.INWITHDRAW,

        status: transactionStatus.ACCEPTED,
        userId: depositIntoSaccoBankAccount.userId,
      });
      return bank;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async outDeposit(outDepositDto: DepositDto): Promise<Bank> {
    //call mpesa service
    //update deposit
    const updateBank = await this.bankRepo.findOneAndUpdate(
      { accountId: outDepositDto.userId, type: bankType.ESCROW },
      {
        $inc: {
          amount: outDepositDto.amount,
        },
      },
      {
        new: true,
      },
    );

    //save transaction
    await this.transaction({
      amount: outDepositDto.amount,
      from: bankType.MPESA,
      to: bankType.ESCROW,
      toId: updateBank._id,
      fromId: outDepositDto.userId,
      type: transactionType.OUTDEPOSIT,
      receiptId: 'mpesaId',
      status: transactionStatus.ACCEPTED,

      userId: outDepositDto.userId,
    });

    return updateBank;
  }

  transaction = (transaction: TransactionDto): Promise<Transaction> => {
    const newTransaction = new this.transactionRepo({
      ...transaction,
    });
    return newTransaction.save();
  };

  async inWithDraw(inWithDraw: InWithDrawDto) {
    const bank = await this.bankRepo.findOne({
      accountId: inWithDraw.userId,
      type: bankType.ESCROW,
    });
    try {
      await this.withdraw(inWithDraw);

      //update the savings bankAccount
      const updatedSavings = await this.bankRepo.findByIdAndUpdate(
        inWithDraw.bankId,
        {
          $inc: {
            amount: inWithDraw.amount,
          },
        },
      );

      await this.transaction({
        amount: inWithDraw.amount,
        from: bankType.ESCROW,
        to: bankType.SAVINGS,
        toId: inWithDraw.savingsId,
        fromId: bank._id,
        type: transactionType.INWITHDRAW,

        status: transactionStatus.ACCEPTED,
        userId: inWithDraw.userId,
      });

      return updatedSavings;
    } catch (error) {
      await this.transaction({
        amount: inWithDraw.amount,
        from: bankType.ESCROW,
        to: bankType.SAVINGS,
        toId: inWithDraw.savingsId,
        fromId: bank._id,
        type: transactionType.INWITHDRAW,
        userId: inWithDraw.userId,
        status: transactionStatus.DECLINED,
      });
      if (error.response.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
  createLoanBank(id: string): Promise<Bank> {
    return this.create({
      accountId: id,
      amount: 0,
      type: bankType.LOAN,
      default: false,
    });
  }

  getUserTransactions(id: string): Promise<Transaction[]> {
    return this.transactionRepo.find({ userId: id }).exec();
  }

  findEscrow(id: string): Promise<Bank> {
    return this.bankRepo
      .findOne({ accountId: id, type: bankType.ESCROW })
      .exec();
  }

  findAll(): Promise<Bank[]> {
    return this.bankRepo.find().exec();
  }

  async transferFunds(transferFunds: TransferFundsDto): Promise<Bank> {
    let bank: Bank;

    bank = await this.bankRepo.findOneAndUpdate(
      {
        accountId: transferFunds.guarantorUserId
          ? transferFunds.guarantorUserId
          : transferFunds.userId,
        default: false,
        type: bankType.DEFAULT_SAVINGS,
      },
      { $inc: { amount: -transferFunds.amount } },
    );

    await this.transaction({
      amount: transferFunds.amount,
      from: bankType.DEFAULT_SAVINGS,
      to: bankType.LOAN,
      toId: transferFunds.loanBankId,
      fromId: bank._id,
      type: transactionType.INWITHDRAW,
      userId: transferFunds.guarantorUserId
        ? transferFunds.guarantorUserId
        : transferFunds.userId,
      status: transactionStatus.DECLINED,
    });

    //from sacco_savings to user
    bank = await this.bankRepo.findByIdAndUpdate(transferFunds.loanBankId, {
      $inc: {
        amount: transferFunds.amount,
      },
    });

    return bank;
  }
  async transferLoanToEscrow(id: string): Promise<Bank> {
    //update loanbank id
    //use the value before update--> new:false
    const loanBank = await this.bankRepo.findByIdAndUpdate(
      new Types.ObjectId(id),
      {
        $set: {
          amount: 0,
        },
      },
    );
    //update bankEscrow
    const escrowBank = await this.bankRepo.findOneAndUpdate(
      { accountId: loanBank.accountId, type: bankType.ESCROW },
      {
        $inc: {
          amount: loanBank.amount,
        },
      },
      {
        new: true,
      },
    );
    //save transaction
    await this.transaction({
      amount: loanBank.amount,
      fromId: loanBank._id,
      toId: escrowBank._id,
      type: transactionType.INDEPOSIT,
      userId: loanBank.accountId,
      from: bankType.LOAN,
      to: bankType.ESCROW,
      status: transactionStatus.ACCEPTED,
    });
    return escrowBank;
  }
  async payLoan(payLoan: PayLoanDto): Promise<Bank> {
    //check if escrow is enough
    let loanBank = await this.bankRepo.findById(payLoan.loanId);
    let escrow = await this.findEscrow(loanBank.accountId);
    if (escrow.amount < payLoan.amount) {
      throw new BadRequestException(`Your escrow is only ${escrow.amount}`);
    }

    //transfer funds
    loanBank = await this.bankRepo.findByIdAndUpdate(loanBank._id, {
      $inc: {
        amount: payLoan.amount,
      },
    });
    //
    await this.bankRepo.findByIdAndUpdate(escrow._id, {
      $inc: {
        amount: -payLoan.amount,
      },
    });

    //save transaction
    await this.transaction({
      amount: payLoan.amount,
      fromId: escrow._id,
      toId: loanBank._id,
      type: transactionType.INWITHDRAW,
      userId: loanBank.accountId,
      from: bankType.ESCROW,
      to: bankType.LOAN,
      status: transactionStatus.ACCEPTED,
    });
    return loanBank;
  }

  async mpesaDeposit(outDeposit) {
    const Timestamp = this.getTimestamp();
    const body = {
      BusinessShortCode: 174379,
      Password: Buffer.from(
        `${this.configService.get('PARTYB')}${this.configService.get(
          'PASSKEY',
        )}${Timestamp}`,
      ).toString('base64'),

      TransactionType: 'CustomerPayBillOnline',
      Amount: outDeposit.amount,
      PartyA: outDeposit.phoneNumber,
      PartyB: this.configService.get('PARTYB'),
      PhoneNumber: Number(outDeposit.phoneNumber),
      CallBackURL: this.configService.get('URL') + '/bank/mpesa/callback',
      AccountReference: 'esacco',
      TransactionDesc: 'deposit',
      Timestamp,
    };

    const { data } = await this.getAccessToken();
    const { access_token } = data;

    try {
      const response = await axios.post(
        this.configService.get('MPESA_EXPRESS_LINK'),
        body,
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
        },
      );

      const CheckoutRequestId = response.data.CheckoutRequestID;
      await this.cacheService.set(
        CheckoutRequestId,
        {
          userId: outDeposit.userId,
          amount: outDeposit.amount,
          phoneNumber: outDeposit.phoneNumber,
        },
        {
          ttl: 1000 * 60 * 60,
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(error.message || error.response.message);
    }
  }

  getAccessToken() {
    const url = this.configService.get('MPESA_CLIENT_CREDENTIALS');
    const auth =
      'Basic ' +
      Buffer.from(
        this.configService.get('CONSUMER_KEY') +
          ':' +
          this.configService.get('CONSUMER_SECRET'),
      ).toString('base64');

    return axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
  }

  getTimestamp = () => {
    let now = new Date();
    let yr = now.getFullYear();
    let mth = now.getMonth() + 1;
    let dy = now.getDate();
    let hr: string = now.getHours().toString();
    let min = now.getMinutes().toString();
    let sec = now.getSeconds().toString();
    let mm = mth < 10 ? '0' + mth : mth;
    let dd = dy < 10 ? '0' + dy : dy;
    hr = parseInt(hr) < 10 ? '0' + hr : hr;
    min = parseInt(min) < 10 ? '0' + min : min;
    sec = parseInt(sec) < 10 ? '0' + sec : sec;
    return '' + yr + mm + dd + hr + min + sec;
  };
  mpesaCallback = async (callBack) => {
    if (callBack.Body.stkCallback.ResultCode == 0) {
      const data: {
        amount: number;
        userId: string;
        phoneNumber: number;
      } = await this.cacheService.get(
        callBack.Body.stkCallback.CheckoutRequestID,
      );

      this.outDeposit({
        ...data,
        amount: data.amount * 1000,
        userId: data.userId,
      });
      await this.cacheService.del(callBack.Body.stkCallback.CheckoutRequestID);
      return;
    } else {
      await this.cacheService.del(callBack.Body.stkCallback.CheckoutRequestID);
    }
  };
  async transferSavingsToEscrow(id: string): Promise<string> {
    const savingsBank = await this.bankRepo.findById(new Types.ObjectId(id));
    const escrowBank = await this.bankRepo.findOneAndUpdate(
      { accountId: savingsBank.accountId, type: bankType.ESCROW },
      {
        $inc: {
          amount: savingsBank.amount,
        },
      },
    );

    await savingsBank.delete();
    return 'success';
  }
}
