import { IsString, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ShiftStatus } from '../entities/assistant-shift.entity'

export class CreateShiftDto {
  @ApiProperty({
    description: 'Assistant ID',
    example: 'assistant-uuid-123',
    type: String,
  })
  @IsString()
  assistantId: string

  @ApiProperty({
    description: 'Shift date',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Shift start time',
    example: '09:00',
    type: String,
  })
  @IsString()
  startTime: string

  @ApiProperty({
    description: 'Shift end time',
    example: '17:00',
    type: String,
  })
  @IsString()
  endTime: string

  @ApiProperty({
    description: 'Clinic ID',
    example: 'clinic-uuid-789',
    type: String,
  })
  @IsString()
  clinicId: string

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
    description: 'Shift status',
    example: ShiftStatus.SCHEDULED,
    enum: ShiftStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus

  @ApiProperty({
    description: 'Additional notes',
    example: 'Regular shift, no special requirements',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string
}

