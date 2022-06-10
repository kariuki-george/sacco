import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BanksProducerService } from 'src/bull/bank.producer.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(@InjectModel(Bank.name) private bankService: Model<Bank>,
  
  private readonly banksQueueProducerService:BanksProducerService
  ) {}
  create(createBankDto: CreateBankDto){
    const newBank = new this.bankService(createBankDto);

    return newBank.save();
  }

  async createForNewSavingsEvent(id: Types.ObjectId) {
    const newBank: CreateBankDto = {
      accountId: id,
      amount: 0,
      type: 'savings',
      default: false,
    };
    try {
      const bank = await this.create(newBank)
      return  this.banksQueueProducerService.newSavingsBank(bank._id, id)


    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  findAll(): Promise<Bank[]> {
    return this.bankService.find().exec();
  }

  findOneWithNameAndDefault(name: string, Default: boolean) {
    return this.bankService
      .findOne({
        name,
        default: Default,
      })
      .exec();
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    return `This action updates a #${id} bank`;
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
