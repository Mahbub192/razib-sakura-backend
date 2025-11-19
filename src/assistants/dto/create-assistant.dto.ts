import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateAssistantDto {
  @ApiProperty({
    description: 'Email address of the assistant',
    example: 'assistant@example.com',
    type: String,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Phone number of the assistant',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'Full name of the assistant',
    example: 'Jane Smith',
    type: String,
  })
  @IsString()
  fullName: string

  @ApiProperty({
    description: 'Password for the assistant account',
    example: 'SecurePass123!',
    type: String,
    format: 'password',
  })
  @IsString()
  password: string

  @ApiProperty({
    description: 'Avatar URL (optional)',
    example: 'https://example.com/avatar.jpg',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({
    description: 'Clinic ID where assistant works (optional)',
    example: 'clinic-uuid-789',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  clinicId?: string

  @ApiProperty({
    description: 'Permissions array (optional)',
    example: ['appointments', 'patients', 'schedule'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}

