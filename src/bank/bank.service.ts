import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from 'src/savings/dto/deposit-saving.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { InWithDrawDto } from './dto/inWithdraw.dto';
import { Bank, bankType } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(@InjectModel(Bank.name) private bankRepo: Model<Bank>) {}
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
        throw new BadRequestException(
          `Your Escrow account is less than ${inWithDraw.amount}`,
        );
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

    try {
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
      return bank;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  outDeposit() {}
  outWithDraw() {}
  inDeposit() {}
  async inWithDraw(inWithDraw: InWithDrawDto) {
    try {
      const res = await this.withdraw(inWithDraw);

      //update the savings bankAccount
      const updatedSavings = await this.bankRepo.findByIdAndUpdate(
        inWithDraw.bankId,
        {
          $inc: {
            amount: inWithDraw.amount,
          },
        },
      );

      return updatedSavings;
    } catch (error) {
      if (error.response.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  findEscrow(id: Types.ObjectId): Promise<Bank> {
    return this.bankRepo
      .findOne({ accountId: id, type: bankType.ESCROW })
      .exec();
  }

  findAll(): Promise<Bank[]> {
    return this.bankRepo.find().exec();
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
