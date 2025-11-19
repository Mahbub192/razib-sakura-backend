import { IsString, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity'

export class CreateAppointmentDto {
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
    description: 'Clinic ID',
    example: 'clinic-uuid-789',
    type: String,
  })
  @IsString()
  clinicId: string

  @ApiProperty({
    description: 'Appointment date',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Appointment time',
    example: '10:30',
    type: String,
  })
  @IsString()
  time: string

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
    type: Number,
  })
  @IsNumber()
  duration: number

  @ApiProperty({
    description: 'Appointment status',
    example: AppointmentStatus.PENDING,
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus

  @ApiProperty({
    description: 'Appointment type',
    example: AppointmentType.CONSULTATION,
    enum: AppointmentType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType

  @ApiProperty({
    description: 'Reason for appointment',
    example: 'Regular check-up',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    description: 'Additional notes',
    example: 'Patient prefers morning appointments',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string
}

