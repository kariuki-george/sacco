import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Types } from 'mongoose';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get()
  findAll() {
    return this.bankService.findAll();
  }

  

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(new Types.ObjectId(id), updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankService.remove(+id);
  }
}
