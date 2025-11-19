import { PartialType } from '@nestjs/mapped-types'
import { CreateShiftDto } from './create-shift.dto'
import { IsOptional, IsEnum } from 'class-validator'
import { ShiftStatus } from '../entities/assistant-shift.entity'

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus
}

