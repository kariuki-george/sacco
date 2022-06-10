import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';

import { Types } from 'mongoose';
import { DepositIntoSavingAccountDto } from './dto/deposit-saving.dto';

@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post()
  create(@Body() createSavingDto: CreateSavingDto) {
    return this.savingsService.create(createSavingDto);
  }

  @Get()
  findAll() {
    return this.savingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingsService.findOne(new Types.ObjectId(id));
  }
  @Get('user/:id')
  findAllByUserId(@Param('id') id: string) {
    return this.savingsService.findAllByUserId(new Types.ObjectId(id));
  }

  @Post('save')
  save(@Body() depositIntoSavingAccountDto: DepositIntoSavingAccountDto) {
    return this.savingsService.depositIntoSavingAccount({
      ...depositIntoSavingAccountDto,
      userId: new Types.ObjectId(depositIntoSavingAccountDto.userId),
      savingsId: new Types.ObjectId(depositIntoSavingAccountDto.savingsId),
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSavingDto: UpdateSavingDto) {
    return this.savingsService.update(new Types.ObjectId(id), updateSavingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsService.remove(+id);
  }
}
