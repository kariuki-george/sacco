import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { BankService } from './bank.service';

interface T {
  id: Types.ObjectId;
}

@Processor('savings')
export class BanksConsumerService {
constructor(
    private readonly bankService:BankService
){}


  @Process('saving-created')
  async process(job: Job<T>) {
    const { id } = job.data;
    await this.bankService.createForNewSavingsEvent(id)
    return id
  }
}
