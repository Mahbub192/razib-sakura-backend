import { IsString, IsDateString, IsArray, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { LabResultStatus } from '../entities/lab-result.entity'

export class CreateLabResultDto {
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
    description: 'Name of the lab test',
    example: 'Complete Blood Count (CBC)',
    type: String,
  })
  @IsString()
  testName: string

  @ApiProperty({
    description: 'Date when the test was performed',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  testDate: string

  @ApiProperty({
    description: 'Array of test results',
    example: [
      {
        name: 'Hemoglobin',
        value: 14.5,
        unit: 'g/dL',
        status: LabResultStatus.NORMAL,
        referenceRange: '12.0-16.0 g/dL',
      },
      {
        name: 'White Blood Cell Count',
        value: 7500,
        unit: 'cells/μL',
        status: LabResultStatus.NORMAL,
        referenceRange: '4000-11000 cells/μL',
      },
    ],
    type: Array,
  })
  @IsArray()
  results: {
    name: string
    value: string | number
    unit: string
    status: LabResultStatus
    referenceRange: string
  }[]

  @ApiProperty({
    description: 'Doctor notes about the results (optional)',
    example: 'All values within normal range. Patient is healthy.',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  doctorNotes?: string
}

