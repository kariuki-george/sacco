import { LoansService } from './loans.service';

import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CreateGuarantorDto } from './dto/createGuarantor.dto';
import { Types } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-guard';
import { CreateLoanTypeDto } from './dto/create-loanType';
import { LoanType } from './entities/loanType.entity';
import { CreateGuarantorResponse } from './res/createGuarantor.res';
import { CreateLoanResponse } from './res/createLoan.res';
import { CreateLoanDto } from './dto/create-loan.dto';
import { PostLoanInitializationDto } from './dto/postLoanInitialization.dto';

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
      userId: new Types.ObjectId(createGuarantor.userId),
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
  getLoanTypes(): Promise<LoanType[]> {
    return this.loansService.getLoanTypes();
  }
  @Query(() => LoanType)
  getLoanTypeId(@Args('loanTypeId') id: string): Promise<LoanType> {
    return this.loansService.getLoanTypeById(new Types.ObjectId(id));
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
      loanTypeId: new Types.ObjectId(createLoan.loanTypeId),
      userId: new Types.ObjectId(createLoan.userId),
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
      loanId: new Types.ObjectId(validateGuarantor.loanId),
    });
  }
}
