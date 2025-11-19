import { IsString, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { MedicalRecordCategory } from '../entities/medical-record.entity'

export class CreateMedicalRecordDto {
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
    description: 'Medical record category',
    example: MedicalRecordCategory.DIAGNOSIS,
    enum: MedicalRecordCategory,
    enumName: 'MedicalRecordCategory',
  })
  @IsEnum(MedicalRecordCategory)
  category: MedicalRecordCategory

  @ApiProperty({
    description: 'Title of the medical record',
    example: 'Annual Physical Examination',
    type: String,
  })
  @IsString()
  title: string

  @ApiProperty({
    description: 'Detailed description',
    example: 'Patient shows normal vital signs. Blood pressure: 120/80. Heart rate: 72 bpm.',
    type: String,
  })
  @IsString()
  description: string

  @ApiProperty({
    description: 'Date of the medical record',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Attachment URLs (optional)',
    example: ['https://example.com/report1.pdf', 'https://example.com/report2.pdf'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]
}

