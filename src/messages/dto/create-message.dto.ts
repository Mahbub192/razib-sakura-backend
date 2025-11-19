import { IsString, IsArray, IsOptional } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  senderId: string

  @IsString()
  receiverId: string

  @IsString()
  content: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]
}

