import { PartialType } from '@nestjs/mapped-types'
import { CreateAssistantDto } from './create-assistant.dto'
import { IsOptional, IsArray, IsString } from 'class-validator'

export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}

