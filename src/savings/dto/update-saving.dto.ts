import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingDto } from './create-saving.dto';

export class UpdateSavingDto extends PartialType(CreateSavingDto) {
  userId?: string;
  amount?: number;

  bankId?: string;
}
