import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(@InjectModel(Bank.name) private bankService: Model<Bank>) {}
  create(createBankDto: CreateBankDto): Promise<Bank> {
    const newBank = new this.bankService(createBankDto);
    return newBank.save();
  }

  findAll(): Promise<Bank[]> {
    return this.bankService.find().exec();
  }

  findOneWithNameAndDefault(name: string, Default: boolean) {
    return this.bankService.findOne({
      name,
      default: Default,
    }).exec();
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    return `This action updates a #${id} bank`;
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
