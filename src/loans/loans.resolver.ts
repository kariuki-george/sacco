import { LoansService } from './loans.service';

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateGuarantorDto } from './dto/createGuarantor.dto';
import { Guarantor } from './entities/guarantor.entity';
import { Types } from 'mongoose';

@Resolver()
export class LoansResolver {
  constructor(private readonly loansService: LoansService) {}

  @Mutation(() => Guarantor)
  createGuarantor(
    @Args('createGurantor') createGuarantor: CreateGuarantorDto,
  ): Promise<Guarantor> {
    return this.loansService.createGuarantor({
      ...createGuarantor,
      userId: new Types.ObjectId(createGuarantor.userId),
    });
  }
}
