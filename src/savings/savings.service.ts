import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { BankService } from 'src/bank/bank.service';
import { SavingsProducerService } from 'src/bull/savings.producer.service';
import { CreateSavingDto } from './dto/create-saving.dto';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { Savings } from './entities/saving.entity';

@Injectable()
export class SavingsService {
  constructor(
    @InjectModel(Savings.name) private savingsRepo: Model<Savings>,
    private readonly bankService: BankService,
    private readonly savingsProducerService: SavingsProducerService,
  ) {}
  async create(createSavingDto: CreateSavingDto): Promise<Savings> {
    try {
      const newSavings = new this.savingsRepo(createSavingDto);
      const savings = await newSavings.save();

      if (!createSavingDto.bankId && !savings.bankId) {
        await this.savingsProducerService.savingCreate(createSavingDto.userId);
      }
      return savings;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createDefaultSavingsAccount(id: Types.ObjectId) {
    const saccoBank = await this.bankService.findOneWithTypeAndDefault(
      'sacco',
      true,
    );


    const createSavingDto: CreateSavingDto = {
      amountSaved: 0,
      name: 'sacco',
      userId: id,
      amountAimed: 0,
      bankId: saccoBank._id,
      frozen: false,
    };
    await this.create(createSavingDto);
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

  async depositIntoSavingAccount(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    try {
      const savingsRecord = await this.findOne(
        depositIntoSavingAccountDto.savingsId,
      );

      await this.savingsProducerService.depositIntoSavingAccount({
        ...depositIntoSavingAccountDto,
        bankId: savingsRecord.bankId,
      });

      return depositIntoSavingAccountDto;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async depositIntoSavingAccountUpdate(
    depositIntoSavingAccountDto: DepositIntoSavingAccountDto,
  ) {
    const { savingsId, ...updateSaving } = depositIntoSavingAccountDto;

    try {
      await this.update(savingsId, updateSaving);

      await this.savingsProducerService.depositIntoSavingAccountComplete(
        depositIntoSavingAccountDto,
      );
    } catch (error) {
      console.log(error);
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
