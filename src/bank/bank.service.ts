import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ) {}
  create(createBankDto: CreateBankDto) {
    const newBank = new this.bankRepo(createBankDto);

    return newBank.save();
  }

  async createSavingsBankAccount(id: Types.ObjectId) {
    const newBank: CreateBankDto = {
      accountId: id,
      amount: 0,
      type: bankType.SAVINGS,
      default: false,
    };
    try {
      const bank = await this.create(newBank);
      return bank;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createEscrow(id: Types.ObjectId) {
    return await this.create({
      accountId: id,
      amount: 0,
      default: false,
      type: bankType.ESCROW,
    });
  }

  async createSaccoSavingBankAccount(id: Types.ObjectId) {
    return await this.create({
      accountId: id,
      amount: 0,
      default: true,
      type: bankType.DEFAULT_SAVINGS,
    });
  }

  async createNormalSavingBankAccount(id: Types.ObjectId) {
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

  outWithDraw() {}
  inDeposit() {}
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

  getUserTransactions(id: Types.ObjectId): Promise<Transaction[]> {
    return this.transactionRepo.find({ userId: id }).exec();
  }

  findEscrow(id: Types.ObjectId): Promise<Bank> {
    return this.bankRepo
      .findOne({ accountId: id, type: bankType.ESCROW })
      .exec();
  }

  findAll(): Promise<Bank[]> {
    return this.bankRepo.find().exec();
  }




}
