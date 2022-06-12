import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { BankService } from 'src/bank/bank.service';
import { SavingsProducerService } from 'src/bull/savings.producer.service';
import { CreateSavingDto } from './dto/create-saving.dto';
import { CreateNormalSavingDto } from './dto/createNormalSaving.dto';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { Savings, savingsType } from './entities/saving.entity';

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

  async createSaccoSavingsAccount(id: Types.ObjectId) {
    const res = await this.savingsProducerService.createSaccoSavingAccount(id);
    const bank = await res.finished();
    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: 'SACCO_SAVINGS',
      type: savingsType.SACCO_SAVINGS,
      userId: id,
      amountAimed: 0,
      bankId: bank._id,
      frozen: false,
    };
    return await this.create(createSavingDto);
  }

  async createDefaultSavingsAccount(id: Types.ObjectId) {
    const res = await this.savingsProducerService.createDefaultSavingAccount(
      id,
    );
    const bank = await res.finished();
    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: 'SACCO_SAVINGS',
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

  findAll(): Promise<Savings[]> {
    return this.savingsRepo.find().exec();
  }

  findOne(id: Types.ObjectId) {
    return this.savingsRepo.findById(id);
  }
  findAllByUserId(id: Types.ObjectId): Promise<Savings[]> {
    return this.savingsRepo.find({ userId: id }).exec();
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
      const savingsRecord = await this.findOne(
        depositIntoSavingAccountDto.savingsId,
      );

      const res = await this.savingsProducerService.depositIntoSavingAccount({
        ...depositIntoSavingAccountDto,
        bankId: savingsRecord.bankId,
      });

      await res.finished();
      //updating the bank finished now update the savings account
      const savingsUpdate = await this.savingsRepo.findByIdAndUpdate(
        depositIntoSavingAccountDto.savingsId,
        {
          $inc: {
            amountSaved: depositIntoSavingAccountDto.amount,
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

  async update(id: Types.ObjectId, updateSavingDto: UpdateSavingDto) {
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

  remove(id: number) {
    return `This action removes a #${id} saving`;
  }
}
