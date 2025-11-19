import { IsOptional, IsString, IsDateString, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdatePatientProfileDto {
  @ApiProperty({
    description: 'Full name of the patient',
    example: 'John Doe',
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
    example: 'john.doe@example.com',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-15',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string

  @ApiProperty({
    description: 'Address',
    example: '123 Main St, City, State 12345',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string

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
    description: 'Emergency contact information',
    example: {
      name: 'Jane Doe',
      phone: '+1234567891',
      relationship: 'Spouse',
    },
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

