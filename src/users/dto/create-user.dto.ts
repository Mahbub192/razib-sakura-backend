import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator'
import { UserRole } from '../../common/enums/user-role.enum'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  phoneNumber: string

  @IsString()
  password: string

  @IsString()
  fullName: string

  @IsEnum(UserRole)
  role: UserRole

  @IsOptional()
  @IsString()
  dateOfBirth?: string

  @IsOptional()
  @IsString()
  gender?: string

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsString()
  licenseNumber?: string
}

