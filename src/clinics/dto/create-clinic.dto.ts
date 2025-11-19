import { IsString, IsEmail, IsObject, IsOptional } from 'class-validator'

export class CreateClinicDto {
  @IsString()
  name: string

  @IsString()
  address: string

  @IsString()
  phone: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsObject()
  operatingHours?: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
}

