import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Types } from 'mongoose';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';

@Controller('banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get("escrow/:id")
  async findEscrow(@Param('id') id: string) {
     return this.bankService.findEscrow(new Types.ObjectId(id));
  }

  

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankService.remove(+id);
  }
}
