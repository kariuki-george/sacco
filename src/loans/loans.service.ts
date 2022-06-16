import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoansProducerService } from 'src/bull/loans.producer.service';
import { Savings } from 'src/savings/entities/saving.entity';
import { CreateGuarantorDto } from './dto/createGuarantor.dto';
import { Guarantor } from './entities/guarantor.entity';
import { Loan } from './entities/loan.entity';
import { LoanType } from './entities/loanType.entity';
import crypto from 'crypto';

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private readonly loansRepo: Model<Loan>,
    @InjectModel(LoanType.name) private readonly loanTypesRepo: Model<LoanType>,
    @InjectModel(Guarantor.name)
    private readonly guarantorsRepo: Model<Guarantor>,
    private readonly loansProducerService: LoansProducerService,
  ) {}
  //guarantor
  async createGuarantor(
    createGuarantor: CreateGuarantorDto,
  ): Promise<Guarantor> {
    //amount, userId,

    try {
      const res = await this.loansProducerService.guarantorCreateChecks(
        createGuarantor.userId,
      );
      
      const guarantorSavings: Savings = await res.finished();
      console.log(guarantorSavings);
      if (guarantorSavings.frozen) {
        throw new BadRequestException('You can apply for another loan');
      }
      if (guarantorSavings.amountSaved / 2 < createGuarantor.amount) {
        throw new BadRequestException(
          `You can only guarantee upto ${guarantorSavings.amountSaved / 2}`,
        );
      }

      const token = crypto.randomBytes(10).toString('hex');
      const guarantor = new this.guarantorsRepo({
        amount: createGuarantor.amount,
        userId: createGuarantor.userId,
        token: token,
      });
      return guarantor.save();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.response.message);
    }
  }
}
