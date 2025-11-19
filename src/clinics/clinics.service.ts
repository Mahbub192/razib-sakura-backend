import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Clinic } from './entities/clinic.entity'
import { CreateClinicDto } from './dto/create-clinic.dto'
import { UpdateClinicDto } from './dto/update-clinic.dto'

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private clinicsRepository: Repository<Clinic>,
  ) {}

  async create(createClinicDto: CreateClinicDto): Promise<Clinic> {
    const clinic = this.clinicsRepository.create(createClinicDto)
    return this.clinicsRepository.save(clinic)
  }

  async findAll(): Promise<Clinic[]> {
    return this.clinicsRepository.find({
      relations: ['doctors'],
    })
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: ['doctors'],
    })
    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${id} not found`)
    }
    return clinic
  }

  async update(id: string, updateClinicDto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id)
    Object.assign(clinic, updateClinicDto)
    return this.clinicsRepository.save(clinic)
  }

  async remove(id: string): Promise<void> {
    const clinic = await this.findOne(id)
    await this.clinicsRepository.remove(clinic)
  }
}

