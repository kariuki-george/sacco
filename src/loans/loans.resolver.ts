import { LoansService } from './loans.service';
import { Args, Mutation, Resolver, Query, Int } from '@nestjs/graphql';
import { CreateGuarantorDto } from './dto/createGuarantor.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';
import { CreateLoanTypeDto } from './dto/create-loanType';
import { LoanType } from './entities/loanType.entity';
import { CreateGuarantorResponse } from './res/createGuarantor.res';
import { CreateLoanResponse } from './res/createLoan.res';
import { CreateLoanDto } from './dto/create-loan.dto';
import { PostLoanInitializationDto } from './dto/postLoanInitialization.dto';
import { GetAllLoansResponse } from './res/getAllLoans';
import { PayLoanDto } from './dto/payLoan.dto';
import { Loan } from './entities/loan.entity';

@Resolver()
export class LoansResolver {
  constructor(private readonly loansService: LoansService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateGuarantorResponse)
  createGuarantor(
    @Args('createGurantor') createGuarantor: CreateGuarantorDto,
  ): Promise<CreateGuarantorResponse> {
    return this.loansService.createGuarantor({
      ...createGuarantor,
      userId: createGuarantor.userId,
    });
  }
  @UseGuards(AdminAuthGuard)
  @Mutation(() => LoanType)
  createLoanType(
    @Args('createLoanType') createLoanType: CreateLoanTypeDto,
  ): Promise<LoanType> {
    return this.loansService.createLoanType(createLoanType);
  }

  @Query(() => [LoanType])
  getAllLoanTypes(): Promise<LoanType[]> {
    return this.loansService.getLoanTypes();
  }
  @Query(() => LoanType)
  getLoanTypeId(@Args('loanTypeId') id: string): Promise<LoanType> {
    return this.loansService.getLoanTypeById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateLoanResponse, {
    description:
      'This mutation can create a guarantorless loan and also initializes guarantor loans. Use this only when validating the first guarantor. For subsequent guarantor validations, use postLoanInitialization mutation',
  })
  initializeLoan(
    @Args('createLoan') createLoan: CreateLoanDto,
  ): Promise<CreateLoanResponse> {
    return this.loansService.initializeLoan({
      ...createLoan,
      loanTypeId: createLoan.loanTypeId,
      userId: createLoan.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CreateLoanResponse, {
    description:
      'This mutation is two be used to verify the second guarantor onwards',
  })
  postLoanInitialization(
    @Args('validateGuarantor') validateGuarantor: PostLoanInitializationDto,
  ): Promise<CreateLoanResponse> {
    return this.loansService.postInitializingLoan({
      ...validateGuarantor,
      loanId: validateGuarantor.loanId,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => GetAllLoansResponse)
  getAllLoansByUserId(
    @Args('userId') id: string,
  ): Promise<GetAllLoansResponse> {
    return this.loansService.getAllLoansByUserId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => String)
  transferLoanToEscrow(@Args('loanId') id: string): Promise<string> {
    return this.loansService.transferLoanToEscrow(id);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Loan)
  payloan(@Args('payloan') payloan: PayLoanDto): Promise<Loan> {
    return this.loansService.payLoan({
      ...payloan,
      loanId: payloan.loanId,
    });
  }

  //@UseGuards(JwtAuthGuard)
  @Query(() => Int, {nullable:true} )
  getTotalLoans(): Promise<number> {
    return this.loansService.getAllLoans();
  }
}
