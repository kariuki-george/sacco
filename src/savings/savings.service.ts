import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bank } from 'src/bank/entities/bank.entity';
import { SavingsProducerService } from 'src/bull/savings.producer.service';
import { FreezeSavingsDto } from 'src/savings/dto/freezeSavings.dto';
import { CreateSavingDto } from './dto/create-saving.dto';
import { CreateNormalSavingDto } from './dto/createNormalSaving.dto';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { Savings, savingsType } from './entities/saving.entity';
import { TransferSavingsToEscrowResponse } from './res/TransferSavings.res';

@Injectable()
export class SavingsService {
  constructor(
    @InjectModel(Savings.name) private savingsRepo: Model<Savings>,
    private readonly savingsProducerService: SavingsProducerService,
  ) {}
  async create(createSavingDto: CreateSavingDto): Promise<Savings> {
    try {
      const newSavings = new this.savingsRepo(createSavingDto);
      return await newSavings.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createSaccoSavingsAccount(id: string) {
    const res = await this.savingsProducerService.createSaccoSavingAccount(id);
    const bank = await res.finished();
    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: savingsType.SACCO_SAVINGS,
      type: savingsType.SACCO_SAVINGS,
      userId: id,
      amountAimed: 0,
      bankId: bank._id,
      frozen: false,
      default: true,
    };
    return await this.create(createSavingDto);
  }

  async createDefaultSavingsAccount(id: string) {
    const res = await this.savingsProducerService.createDefaultSavingAccount(
      id,
    );
    const bank = await res.finished();
    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: savingsType.SACCO_SAVINGS,
      type: savingsType.SACCO_SAVINGS,
      userId: id,
      amountAimed: 0,
      bankId: bank._id,
      frozen: false,
    };
    return await this.create(createSavingDto);
  }

  async createNormalSavingsAccount(createNormalSaving: CreateNormalSavingDto) {
    const res = await this.savingsProducerService.createNormalSavingAccount(
      createNormalSaving.userId,
    );

    const bank = await res.finished();
    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: createNormalSaving.name,
      type: savingsType.USER_SAVINGS,
      userId: createNormalSaving.userId,
      amountAimed: createNormalSaving.amountAimed,
      bankId: bank._id,
      frozen: false,
    };

    return await this.create(createSavingDto);
  }

  async findTotalSavings(): Promise<Number> {
    const bank = await this.savingsRepo.findOne({
      name: savingsType.SACCO_SAVINGS,
      default: true,
    });
    return bank.amountSaved;
  }

  findAll(): Promise<Savings[]> {
    return this.savingsRepo.find().exec();
  }

  findById(id: string): Promise<Savings> {
    return this.savingsRepo.findById(id).exec();
  }
  findAllByUserId(id: string): Promise<Savings[]> {
    return this.savingsRepo.find({ userId: id }).exec();
  }
  findOne(userId: string): Promise<Savings> {
    return this.savingsRepo
      .findOne({
        userId,
        type: savingsType.SACCO_SAVINGS,
        default: false,
      })
      .exec();
  }
  async depositIntoSaccoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    //save into individual account normally
    const savingsResponse = await this.depositIntoSavingAccount(
      depositIntoSavingAccountDto,
    );
    //create update saccoSavings event since its implementation is different
    try {
      const saccoBank =
        await this.savingsProducerService.depositIntoSaccoSavingAccount(
          depositIntoSavingAccountDto,
        );
      const res = await saccoBank.finished();

      await this.savingsRepo.findOneAndUpdate(
        { bankId: res._id },
        {
          $inc: {
            amountSaved: depositIntoSavingAccountDto.amount,
          },
        },
      );
      return savingsResponse;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async depositIntoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    try {
      const savingsRecord = await this.findById(
        depositIntoSavingAccountDto.savingsId,
      );

      const res = await this.savingsProducerService.depositIntoSavingAccount({
        ...depositIntoSavingAccountDto,
        bankId: savingsRecord.bankId,
      });

      await res.finished();
      //updating the bank finished now update the savings account
      //then for any savings, cap amountLoanable to 100% of what has been deposited.
      const savingsUpdate = await this.savingsRepo.findByIdAndUpdate(
        depositIntoSavingAccountDto.savingsId,
        {
          $inc: {
            amountSaved: depositIntoSavingAccountDto.amount,
            amountLoanable: depositIntoSavingAccountDto.amount,
          },
        },
        {
          new: true,
        },
      );

      return savingsUpdate;
    } catch (error) {
      if (error.message) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateSavingDto: UpdateSavingDto) {
    return await this.savingsRepo.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateSavingDto,
        },
        $inc: { amountSaved: updateSavingDto.amount },
      },
      {
        new: true,
      },
    );
  }

  freezeSavingsAccount(freezeSavings: FreezeSavingsDto): Promise<Savings> {
    return this.savingsRepo
      .findOneAndUpdate(
        { userId: freezeSavings.userId },
        { $inc: { amountLoanable: -freezeSavings.amount } },
        { new: true },
      )
      .exec();
  }

  async transferSavingsToEscrow(
    id: string,
  ): Promise<TransferSavingsToEscrowResponse> {
    const savings = await this.savingsRepo.findById(new Types.ObjectId(id));

    if (savings.type === savings.name) {
      return {
        error: {
          message: 'Cannot tranfer this type of loan',
          error: true,
        },
      };
    }
    const res = await this.savingsProducerService.transferSavingsToEscrow(
      savings.bankId,
    );
    await res.finished();

    await savings.delete();

    return { message: 'Successfully transferred money to escrow' };
  }
}
