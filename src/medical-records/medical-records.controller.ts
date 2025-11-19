import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common'
import { MedicalRecordsService } from './medical-records.service'
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto)
  }

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    if (patientId) {
      return this.medicalRecordsService.findByPatient(patientId)
    }
    return this.medicalRecordsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id)
  }
}

