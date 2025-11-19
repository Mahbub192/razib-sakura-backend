import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Prescription } from './entities/prescription.entity'
import { CreatePrescriptionDto } from './dto/create-prescription.dto'
import { UpdatePrescriptionDto } from './dto/update-prescription.dto'

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionsRepository.create(createPrescriptionDto)
    return this.prescriptionsRepository.save(prescription)
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      relations: ['patient', 'doctor'],
      order: { prescribedDate: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    })
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`)
    }
    return prescription
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { prescribedDate: 'DESC' },
    })
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id)
    Object.assign(prescription, updatePrescriptionDto)
    return this.prescriptionsRepository.save(prescription)
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id)
    await this.prescriptionsRepository.remove(prescription)
  }
}

