import { IsString, IsDateString, IsArray, IsEnum, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PrescriptionStatus } from '../entities/prescription.entity'

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'patient-uuid-123',
    type: String,
  })
  @IsString()
  patientId: string

  @ApiProperty({
    description: 'Doctor ID',
    example: 'doctor-uuid-456',
    type: String,
  })
  @IsString()
  doctorId: string

  @ApiProperty({
    description: 'Array of medications',
    example: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
        instructions: 'Take with food',
      },
    ],
    type: Array,
  })
  @IsArray()
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]

  @ApiProperty({
    description: 'Prescription status',
    example: PrescriptionStatus.ACTIVE,
    enum: PrescriptionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus

  @ApiProperty({
    description: 'Date when prescription was prescribed',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  prescribedDate: string

  @ApiProperty({
    description: 'Expiry date of the prescription (optional)',
    example: '2025-12-15',
    type: String,
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @ApiProperty({
    description: 'Number of refills remaining (optional)',
    example: 3,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  refillsRemaining?: number
}

