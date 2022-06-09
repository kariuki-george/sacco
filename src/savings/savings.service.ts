import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateBankDto } from 'src/bank/dto/create-bank.dto';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { Savings } from './entities/saving.entity';

@Injectable()
export class SavingsService {
  constructor(
    @InjectModel(Savings.name) private savingsService: Model<Savings>,
  ) {}
  create(createSavingDto: CreateSavingDto): Promise<Savings> {
    try {
      const newSavings = new this.savingsService(createSavingDto);

      return newSavings.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  findAll(): Promise<Savings[]> {
    return this.savingsService.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} saving`;
  }
  findAllByUserId(id: string): Promise<Savings[]> {

    return this.savingsService.find({ userId: new mongoose.Types.ObjectId(id)}).exec();
  }

  update(id: number, updateSavingDto: UpdateSavingDto) {
    return `This action updates a #${id} saving`;
  }

  remove(id: number) {
    return `This action removes a #${id} saving`;
  }
}
