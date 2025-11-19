import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MedicalRecord } from './entities/medical-record.entity'
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto'

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = this.medicalRecordsRepository.create(createMedicalRecordDto)
    return this.medicalRecordsRepository.save(medicalRecord)
  }

  async findAll(): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      relations: ['patient', 'doctor'],
      order: { date: 'DESC' },
    })
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    })
    if (!medicalRecord) {
      throw new NotFoundException(`Medical record with ID ${id} not found`)
    }
    return medicalRecord
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { date: 'DESC' },
    })
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id)
    Object.assign(medicalRecord, updateMedicalRecordDto)
    return this.medicalRecordsRepository.save(medicalRecord)
  }

  async remove(id: string): Promise<void> {
    const medicalRecord = await this.findOne(id)
    await this.medicalRecordsRepository.remove(medicalRecord)
  }
}

