import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { CreateSavingDto } from './create-saving.dto';

export class UpdateSavingDto extends PartialType(CreateSavingDto) {
    bankId?: Types.ObjectId;
    userId?: Types.ObjectId;
}
