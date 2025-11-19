import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../common/enums/user-role.enum'

export class RegisterDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    type: String,
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  fullName: string

  @ApiProperty({
    description: 'Role of the user',
    example: UserRole.PATIENT,
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole)
  role: UserRole

  @ApiProperty({
    description: 'Date of birth (optional)',
    example: '1990-01-15',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  dateOfBirth?: string

  @ApiProperty({
    description: 'Gender (optional)',
    example: 'male',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string
}

