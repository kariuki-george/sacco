import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { Bank } from 'src/bank/entities/bank.entity';
import { FreezeSavingsDto } from '../savings/dto/freezeSavings.dto';
import { GetAllLoansResponse } from './res/getAllLoans';
import { TransferFundsDto } from './dto/transferFunds.dto';

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
      const res = await this.loansProducerService.getSavings(
        createGuarantor.userId,
      );

      const guarantorSavings: Savings = await res.finished();

      if (guarantorSavings.amountLoanable / 2 < createGuarantor.amount) {
        throw new BadRequestException(
          `You can only guarantee upto ${guarantorSavings.amountLoanable / 2}`,
        );
      }
      const chance = new Chance();

      const token = chance.hash({ length: 12 });

      //create a token and store the guarantor info in a 5 min cache
      await this.cacheService.set(
        token,
        {
          token,
          userId: createGuarantor.userId,
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
  async createLoanType(createLoanType: CreateLoanTypeDto): Promise<LoanType> {
    try {
      const loanType = new this.loanTypesRepo(createLoanType);
      return await loanType.save();
    } catch (error) {
      throw new BadRequestException(error.message || error.response.message);
    }
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

  async fetchSavings(userId: Types.ObjectId): Promise<Savings> {
    const savings = await this.loansProducerService.getSavings(userId);
    return savings.finished();
  }

  async createLoanBank(userId: Types.ObjectId): Promise<Bank> {
    const loan = await this.loansProducerService.createLoanBank(userId);
    return loan.finished();
  }

  async freezeSavingsAccount(
    freezeSavings: FreezeSavingsDto,
  ): Promise<Savings> {
    const savings = await this.loansProducerService.freezeSavingsAccount(
      freezeSavings,
    );
    return savings.finished();
  }

  async transferFunds(transferFunds: TransferFundsDto): Promise<Bank> {
    const res = await this.loansProducerService.transferFunds(transferFunds);
    return res.finished();
  }

  async initializeLoan(
    initializeLoan: CreateLoanDto,
  ): Promise<CreateLoanResponse> {
    try {
      //identify the loan type
      const loanType = await this.loanTypesRepo.findById(
        initializeLoan.loanTypeId,
      );

      //get userSavings

      const userSavings = await this.fetchSavings(initializeLoan.userId);

      //max loan a user can possibly borrow
      const maxLoanable = (userSavings.amountLoanable * loanType.maxLoan) / 100;
      //calculate loanAmount after interest is applied..== amount to be paid
      const loanAndInterest =
        initializeLoan.amount * (1 + loanType.interestRate / 100);

      //constants
      let loan: Loan;
      let loanBank: Bank;

      if (loanType.guarantor && initializeLoan.token) {
        //confirm this is a guarantor loan

        //this is guarantor loan...validation required
        const guarantorInfo: Guarantor = await this.cacheService.get(
          initializeLoan.token,
        );
        if (!guarantorInfo) {
          throw new Error(
            `Provided token ${initializeLoan.token} already expired or doesn't exist.`,
          );
        }

        let message: string;
        let amountRemaining: number;

        //token valid
        //validate user savings
        let amountRemainingForGuarantors =
          initializeLoan.amount - userSavings.amountLoanable;

        //create loan
        loanBank = await this.createLoanBank(initializeLoan.userId);
        //check if guarantor can fill for amountRemainingForGuarantors loan
        amountRemaining = amountRemainingForGuarantors - guarantorInfo.amount;
        if (amountRemainingForGuarantors > guarantorInfo.amount) {
          //require another guarantor
          loan = await this.createLoan({
            ...initializeLoan,
            bankId: loanBank._id,
            guarantor: true,
            processing: true,
            amountRemaining,
          });
          message = 'Token verified, another token required!';
          amountRemaining = Math.round(
            amountRemainingForGuarantors - guarantorInfo.amount,
          );
        } else if (amountRemainingForGuarantors === guarantorInfo.amount) {
          //amount fits perfectly
          loan = await this.createLoan({
            ...initializeLoan,
            bankId: loanBank._id,
            guarantor: true,
            processing: false,
            canWithdraw: true,
          });
          message = 'Loan applied for successfully';
          amountRemaining = 0;
        } else if (amountRemainingForGuarantors < guarantorInfo.amount) {
          //guarantor has pledged a greater amount than required
          loan = await this.createLoan({
            ...initializeLoan,
            amount:
              initializeLoan.amount +
              (guarantorInfo.amount - amountRemainingForGuarantors),
            bankId: loanBank._id,
            guarantor: true,
            processing: false,
            canWithdraw: true,
          });
          amountRemaining = 0;
          message =
            'Loan applied for successfully. Guarantor overpledged. Excess amount added to your loan.';
        }

        //freeze user savings

        //savings.amountLoanable since all users savings are used
        await this.freezeSavingsAccount({
          userId: initializeLoan.userId,
          amount: userSavings.amountLoanable,
        });
        //freeze guarantor savings

        await this.freezeSavingsAccount({
          amount: guarantorInfo.amount,
          userId: guarantorInfo.userId,
        });
        //delete tokens
        await this.cacheService.del(guarantorInfo.token);
        //transfer funds
        //from guarantor

        await this.transferFunds({
          amount: guarantorInfo.amount,

          guarantorUserId: guarantorInfo.userId,
          loanBankId: loanBank._id,
        });

        //from user sacco savings
        await this.transferFunds({
          amount: userSavings.amountLoanable,
          userId: initializeLoan.userId,
          loanBankId: loanBank._id,
        });

        //return
        return {
          loan,
          message,
          amountRemaining,
          token: [
            {
              status: TokenValidationStatus.ACCEPTED,
              token: guarantorInfo.token,
            },
          ],
        };
      }

      //no token provided...loan can be guarantor based or nonguarantor based
      //identify the type of loan using loanType
      if (loanType.guarantor) {
        //this is a guarantor loan
        //check if savings are enough
        if (initializeLoan.amount > maxLoanable) {
          throw new BadRequestException({
            message: `You can only borrow upto ${maxLoanable}. Guarantor needed.`,
          });
        }
        //savings enough
        //create loan bank
        loanBank = await this.createLoanBank(initializeLoan.userId);
        //create loan
        loan = await this.createLoan({
          ...initializeLoan,
          bankId: loanBank._id,
          guarantor: false,
          canWithdraw: true,
        });
        //freeze savings to a certain amount
        //amount = amount requested
        await this.freezeSavingsAccount({
          amount: loanAndInterest,
          userId: initializeLoan.userId,
        });
        //transfer funds
        await this.transferFunds({
          loanBankId: loanBank._id,
          amount: loanAndInterest,
          userId: initializeLoan.userId,
        });
        //return
        return {
          loan,
          message: 'Loan applied successfully',
          amountRemaining: 0,
        };
      }
      //this is not a guarantor loan
      //check if user savings are not enough
      if (maxLoanable < initializeLoan.amount) {
        throw new BadRequestException({
          message: `You can only borrow upto ${maxLoanable}`,
        });
      }
      //sacco_savings are enough
      //create loanBank
      loanBank = await this.createLoanBank(initializeLoan.userId);

      //create loan
      loan = await this.createLoan({
        ...initializeLoan,
        bankId: loanBank._id,
        canWithdraw: true,
      });

      //freeze savings to certain amount

      await this.freezeSavingsAccount({
        amount: loanAndInterest,
        userId: initializeLoan.userId,
      });

      //transfer funds
      await this.transferFunds({
        loanBankId: loanBank._id,
        amount: loanAndInterest,
        userId: initializeLoan.userId,
      });

      //return {}
      return {
        loan,
        message: 'Loan applied successfully',
        amountRemaining: 0,
      };
    } catch (error) {
      throw new BadRequestException(error.message || error.response.message);
    }
  }

  async postInitializingLoan(
    postLoanInitializion: PostLoanInitializationDto,
  ): Promise<CreateLoanResponse> {
    try {
      /*
    get loan id, token
     */
      let loan = await this.loansRepo.findById(postLoanInitializion.loanId);
      if (!loan) {
        throw new NotFoundException(
          `loan with id of ${postLoanInitializion.loanId} not found`,
        );
      }

      const guarantorInfo: Guarantor = await this.cacheService.get(
        postLoanInitializion.token,
      );

      //throw an error if token doesn't exist
      if (!guarantorInfo) {
        throw new Error(
          `Provided token ${postLoanInitializion.token} already expired or doesn't exist.`,
        );
      }
      //delete guarantor token
      await this.cacheService.del(guarantorInfo.token);

      let guarantor: Guarantor;
      //token is valid
      const amountRemainingAfterGuarantor =
        loan.amountRemaining - guarantorInfo.amount;
      //if amount is enough needed no other guarantor
      let message: string;

      if (amountRemainingAfterGuarantor == guarantorInfo.amount) {
        //create guarantor and update loan info
        loan = await this.loansRepo.findByIdAndUpdate(
          loan._id,
          {
            $set: {
              processing: false,
              canWithdraw: true,
              amountRemaining: 0,
            },
          },
          {
            new: true,
          },
        );
        message = 'Loan created successfully';
      } else if (amountRemainingAfterGuarantor < guarantorInfo.amount) {
        loan = await this.loansRepo.findByIdAndUpdate(
          loan._id,
          {
            $set: {
              processing: false,
              canWithdraw: true,
              amountRemaining: 0,
            },
            $inc: {
              amount: guarantorInfo.amount - amountRemainingAfterGuarantor,
            },
          },
          {
            new: true,
          },
        );
        message =
          'Loan create successfully. Guarantor pledged an excess amount. The excess has been added to your loan';
      } else {
        loan = await this.loansRepo.findByIdAndUpdate(
          loan._id,
          {
            $set: {
              processing: true,
            },
            $inc: {
              amountRemaining: -guarantorInfo.amount,
            },
          },
          {
            new: true,
          },
        );
        message = 'Token validated, Another token required';
      }

      guarantor = await this.saveGuarantor({
        ...guarantorInfo,
        loanId: loan._id,
      });
      //get all tokens related to this loan
      const guarantors = await this.guarantorsRepo.find({ loanId: loan._id });
      let index = 0;
      let token: Token[] = [];
      while (guarantors.length > index) {
        token.push({
          status: TokenValidationStatus.ACCEPTED,
          token: guarantors[index].token,
        });
        index += 1;
      }

      token.push({
        status: TokenValidationStatus.ACCEPTED,
        token: guarantorInfo.token,
      });

      //transfer funds
      await this.transferFunds({
        amount: guarantorInfo.amount,
        guarantorUserId: guarantorInfo.userId,
        loanBankId: loan.bankId,
      });

      return {
        loan,
        token,
        message,
        amountRemaining: loan.amountRemaining,
      };
    } catch (error) {
      throw new BadRequestException(error.message || error.response.message);
    }
  }

  async getAllLoansByUserId(
    userId: Types.ObjectId,
  ): Promise<GetAllLoansResponse> {
    //check current loans
    const loans = await this.loansRepo.find({ userId });
    //check guarantor loans
    const guarantorLoans = await this.guarantorsRepo.find({ userId });
    return {
      loans,
      guarantorLoans,
    };
  }
}
