import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateDoctorProfileDto {
  @ApiProperty({
    description: 'Full name of the doctor',
    example: 'Dr. John Smith',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({
    description: 'Email address',
    example: 'doctor@example.com',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({
    description: 'Medical specialty',
    example: 'Cardiology',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string

  @ApiProperty({
    description: 'Biography or professional description',
    example: 'Experienced cardiologist with 15 years of practice...',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string

  @ApiProperty({
    description: 'Years of experience',
    example: 15,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({
    description: 'Qualifications array',
    example: [
      {
        degree: 'MD',
        university: 'Harvard Medical School',
        year: 2005,
      },
    ],
    type: Array,
    required: false,
  })
  @IsOptional()
  @IsObject()
  qualifications?: {
    degree: string
    university: string
    year: number
  }[]

  @ApiProperty({
    description: 'Availability schedule',
    example: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
    },
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsObject()
  availability?: {
    days: string[]
    startTime: string
    endTime: string
  }
}

