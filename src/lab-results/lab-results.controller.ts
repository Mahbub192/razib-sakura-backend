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
import { LabResultsService } from './lab-results.service'
import { CreateLabResultDto } from './dto/create-lab-result.dto'
import { UpdateLabResultDto } from './dto/update-lab-result.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Post()
  create(@Body() createLabResultDto: CreateLabResultDto) {
    return this.labResultsService.create(createLabResultDto)
  }

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    if (patientId) {
      return this.labResultsService.findByPatient(patientId)
    }
    return this.labResultsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labResultsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabResultDto: UpdateLabResultDto) {
    return this.labResultsService.update(id, updateLabResultDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labResultsService.remove(id)
  }
}

