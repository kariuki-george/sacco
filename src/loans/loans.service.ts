import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoansProducerService } from 'src/bull/loans.producer.service';
import { Savings } from 'src/savings/entities/saving.entity';
import { CreateGuarantorDto } from './dto/createGuarantor.dto';
import { Guarantor } from './entities/guarantor.entity';
import { Loan } from './entities/loan.entity';
import { LoanType } from './entities/loanType.entity';

import { CreateLoanTypeDto } from './dto/create-loanType';

import crypto from 'crypto';
import { Chance } from 'chance';
import { Cache } from 'cache-manager';
import { CreateGuarantorResponse } from './res/createGuarantor.res';
import { CreateLoanDto } from './dto/create-loan.dto';
import {
  CreateLoanResponse,
  Token,
  TokenValidationStatus,
} from './res/createLoan.res';
import { PostLoanInitializationDto } from './dto/postLoanInitialization.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private readonly loansRepo: Model<Loan>,
    @InjectModel(LoanType.name) private readonly loanTypesRepo: Model<LoanType>,
    @InjectModel(Guarantor.name)
    private readonly guarantorsRepo: Model<Guarantor>,
    private readonly loansProducerService: LoansProducerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}
  //guarantor
  async createGuarantor(
    createGuarantor: CreateGuarantorDto,
  ): Promise<CreateGuarantorResponse> {
    //amount, userId,

    try {
      const res = await this.loansProducerService.guarantorCreateChecks(
        createGuarantor.userId,
      );

      const guarantorSavings: Savings = await res.finished();

      if (guarantorSavings.frozen) {
        throw new BadRequestException('You cannot apply for another loan');
      }

      if (guarantorSavings.amountSaved / 2 < createGuarantor.amount) {
        throw new BadRequestException(
          `You can only guarantee upto ${guarantorSavings.amountSaved / 2}`,
        );
      }
      const chance = new Chance();

      const token = chance.hash({ length: 12 });

      //create a token and store the guarantor info in a 5 min cache
      const value = await this.cacheService.set(
        token,
        {
          token,
          userId: createGuarantor.amount,
          amount: createGuarantor.amount,
        },
        {
          ttl: 300,
        },
      );

      return { token };
    } catch (error) {
      if (error.message || error.response.message) {
        throw new BadRequestException(error.message || error.response.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  saveGuarantor(saveGuarantor: Guarantor): Promise<Guarantor> {
    const guarantor = new this.guarantorsRepo(saveGuarantor);
    return guarantor.save();
  }

  //loansTypes
  createLoanType(createLoanType: CreateLoanTypeDto): Promise<LoanType> {
    const loanType = new this.loanTypesRepo(createLoanType);
    return loanType.save();
  }

  getLoanTypes(): Promise<LoanType[]> {
    return this.loanTypesRepo.find().exec();
  }
  getLoanTypeById(id: Types.ObjectId): Promise<LoanType> {
    return this.loanTypesRepo.findById(id).exec();
  }

  //loans
  createLoan(createLoan: CreateLoanDto): Promise<Loan> {
    const loan = new this.loansRepo(createLoan);
    return loan.save();
  }

  async initializeLoan(
    initializeLoan: CreateLoanDto,
  ): Promise<CreateLoanResponse> {
    const loanType = await this.loanTypesRepo.findById(
      initializeLoan.loanTypeId,
    );
    const amountAfterInterest =
      initializeLoan.amount * (1 + loanType.interestRate / 100);
    //if loan does not require a guarantor

    if (!initializeLoan.token) {
      //confirm that loan does not require a guarantor

      if (loanType.guarantor) {
        throw new BadRequestException(
          'Cannot apply for this loan without guarantor',
        );
      }
      const loan = await this.createLoan({
        ...initializeLoan,
        amount: amountAfterInterest,
      });
      return { loan, message: 'Loan applied successfully' };
    }

    //this is for loans that require guarantors
    const guarantorInfo: Guarantor = await this.cacheService.get(
      initializeLoan.token,
    );

    //delete guarantor token
    await this.cacheService.del(guarantorInfo.token);
    if (!guarantorInfo) {
      throw new BadRequestException({
        token: [
          {
            status: TokenValidationStatus.DECLINED,
            token: initializeLoan.token,
          },
        ],
        amountRemaining: amountAfterInterest,
        message: "Token expired or doesn't exist",
      });
    }

    //check if another guarantor is required then create a loan
    let guarantor: Guarantor;
    let loan: Loan;
    if (guarantorInfo.amount <= amountAfterInterest) {
      //create a loan
      loan = await this.createLoan({ ...initializeLoan, guarantor: true });
      //another guarantor is required
      guarantor = await this.saveGuarantor({
        ...guarantorInfo,
        loanId: loan._id,
      });
      //delete key in cache

      return {
        loan,
        token: [
          {
            status: TokenValidationStatus.ACCEPTED,
            token: guarantor.token,
          },
        ],
        message: 'Loan applied successfully.',
        amountRemaining: amountAfterInterest - initializeLoan.amount,
      };
    }
    //another guarantor is not required
    //create loan
    loan = await this.createLoan({
      ...initializeLoan,
      processing: true,
      guarantor: true,
    });

    //create a guarantor
    guarantor = await this.saveGuarantor({
      ...guarantorInfo,
      loanId: loan._id,
    });

    //return loan and token
    return {
      loan,
      message: 'Requires another guarantor',
      amountRemaining: amountAfterInterest - initializeLoan.amount,
      token: [
        {
          status: TokenValidationStatus.ACCEPTED,
          token: guarantor.token,
        },
      ],
    };
  }

  async postInitializingLoan(
    postLoanInitializion: PostLoanInitializationDto,
  ): Promise<CreateLoanResponse> {
    /*
    get loan id, token
     */
    let loan = await this.loansRepo.findById(postLoanInitializion.loanId);

    const guarantorInfo: Guarantor = await this.cacheService.get(
      postLoanInitializion.token,
    );
    //delete guarantor token
    await this.cacheService.del(guarantorInfo.token);
    //throw an error if token doesn't exist
    if (!guarantorInfo) {
      throw new BadRequestException({
        token: [
          {
            status: TokenValidationStatus.DECLINED,
            token: postLoanInitializion.token,
          },
        ],
        amountRemaining: loan.amount,
        message: "Token expired or doesn't exist",
      });
    }

    let guarantor: Guarantor;
    //token is valid
    const amountRemaining = loan.amount - guarantorInfo.amount;
    //if amount is enough needed no other guarantor

    if (amountRemaining <= guarantorInfo.amount) {
      //create guarantor and update loan info
      loan = await this.loansRepo.findByIdAndUpdate(loan._id, {
        $set: {
          processing: false,
        },
      });
      guarantor = await this.saveGuarantor({
        ...guarantorInfo,
        loanId: loan._id,
      });
      //get all tokens related to this loan
      const guarantors = await this.guarantorsRepo.find({ loanId: loan._id });
      let index = 0;
      let tokens: Token[] = [];
      while (tokens.length > index) {
        tokens.push({
          status: TokenValidationStatus.ACCEPTED,
          token: guarantors[index].token,
        });
        index += 1;
      }

      tokens[tokens.length] = {
        status: TokenValidationStatus.ACCEPTED,
        token: guarantorInfo.token,
      };

      return {
        loan,
        token: [...tokens],
        message: 'Loan applied successfully',
        amountRemaining: amountRemaining,
      };
    }

    //require more guarantors

    //create a new guarantor
    guarantor = await this.saveGuarantor({
      ...guarantorInfo,
      loanId: loan._id,
    });
    //get all tokens related to this loan
    const guarantors = await this.guarantorsRepo.find({ loanId: loan._id });
    let index = 0;
    let tokens: Token[] = [];
    while (tokens.length > index) {
      tokens.push({
        status: TokenValidationStatus.ACCEPTED,
        token: guarantors[index].token,
      });
      index += 1;
    }

    tokens[tokens.length] = {
      status: TokenValidationStatus.ACCEPTED,
      token: guarantorInfo.token,
    };

    return {
      loan,
      token: [...tokens],
      message: 'Requires more guarantors',
      amountRemaining: amountRemaining,
    };
  }
}
