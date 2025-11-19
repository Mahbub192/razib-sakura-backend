import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LabResult } from './entities/lab-result.entity'
import { CreateLabResultDto } from './dto/create-lab-result.dto'
import { UpdateLabResultDto } from './dto/update-lab-result.dto'

@Injectable()
export class LabResultsService {
  constructor(
    @InjectRepository(LabResult)
    private labResultsRepository: Repository<LabResult>,
  ) {}

  async create(createLabResultDto: CreateLabResultDto): Promise<LabResult> {
    const labResult = this.labResultsRepository.create({
      ...createLabResultDto,
      testDate: new Date(createLabResultDto.testDate),
    })
    return this.labResultsRepository.save(labResult)
  }

  async findAll(): Promise<LabResult[]> {
    return this.labResultsRepository.find({
      relations: ['patient', 'doctor'],
      order: { testDate: 'DESC' },
    })
  }

  async findOne(id: string): Promise<LabResult> {
    const labResult = await this.labResultsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    })
    if (!labResult) {
      throw new NotFoundException(`Lab result with ID ${id} not found`)
    }
    return labResult
  }

  async findByPatient(patientId: string): Promise<LabResult[]> {
    return this.labResultsRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { testDate: 'DESC' },
    })
  }

  async update(id: string, updateLabResultDto: UpdateLabResultDto): Promise<LabResult> {
    const labResult = await this.findOne(id)
    Object.assign(labResult, updateLabResultDto)
    return this.labResultsRepository.save(labResult)
  }

  async remove(id: string): Promise<void> {
    const labResult = await this.findOne(id)
    await this.labResultsRepository.remove(labResult)
  }
}

