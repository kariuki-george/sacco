import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Types } from 'mongoose';

@Injectable()
export class LoansProducerService {
  constructor(@InjectQueue('loans') private loansQueue: Queue) {}

  guarantorCreateChecks(id: Types.ObjectId) {
    return this.loansQueue.add('guarantor-createCheck', {
      id,
    });
  }
}
