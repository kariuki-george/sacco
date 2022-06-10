import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BanksProducerService } from 'src/bull/bank.producer.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { InWithDrawDto } from './dto/inWithdraw.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectModel(Bank.name) private bankRepo: Model<Bank>,

    private readonly banksQueueProducerService: BanksProducerService,
  ) {}
  create(createBankDto: CreateBankDto) {
    const newBank = new this.bankRepo(createBankDto);

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
      const bank = await this.create(newBank);
      return this.banksQueueProducerService.newSavingsBank(bank._id, id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  update(id: Types.ObjectId, updateBankDto: UpdateBankDto): Promise<Bank> {
    return this.bankRepo
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateBankDto,
          },
          $inc: {
            amount: updateBankDto.amount,
          },
        },
        {
          new: true,
        },
      )
      .exec();
  }
  outDeposit() {}
  outWithDraw() {}
  inDeposit() {}
  inWithDraw(inWithDraw: InWithDrawDto) {
    try {
      return this.banksQueueProducerService.newBankInWithdrawal(inWithDraw);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  findAll(): Promise<Bank[]> {
    return this.bankRepo.find().exec();
  }

  findOneWithTypeAndDefault(type: string, Default: boolean) {
    return this.bankRepo.findOne({
      default: true
    });
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
