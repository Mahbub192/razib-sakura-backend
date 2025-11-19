import { PartialType } from '@nestjs/mapped-types'
import { CreatePrescriptionDto } from './create-prescription.dto'
import { IsOptional, IsEnum } from 'class-validator'
import { PrescriptionStatus } from '../entities/prescription.entity'

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus
}

