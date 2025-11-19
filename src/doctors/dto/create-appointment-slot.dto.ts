import { IsString, IsDateString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CreateAppointmentSlotDto {
  @ApiProperty({
    description: 'Date for the appointment slot',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Start time of the slot',
    example: '09:00',
    type: String,
  })
  @IsString()
  startTime: string

  @ApiProperty({
    description: 'End time of the slot',
    example: '17:00',
    type: String,
  })
  @IsString()
  endTime: string

  @ApiProperty({
    description: 'Duration of each slot in minutes',
    example: 30,
    type: Number,
  })
  @IsNumber()
  slotDuration: number // in minutes

  @ApiProperty({
    description: 'Clinic ID where the slot is available',
    example: 'clinic-uuid-789',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  clinicId?: string

  @ApiProperty({
    description: 'Associated resources (rooms, equipment, etc.)',
    example: ['Room 1', 'Equipment A'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  associatedResources?: string[]

  @ApiProperty({
    description: 'Recurrence pattern for the slot',
    example: RecurrenceType.WEEKLY,
    enum: RecurrenceType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType

  @ApiProperty({
    description: 'Recurrence end date (timestamp) or number of occurrences',
    example: 1735689600000,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recurrenceEndDate?: number // number of occurrences or end date timestamp
}

