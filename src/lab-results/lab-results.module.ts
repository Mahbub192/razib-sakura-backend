import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LabResultsService } from './lab-results.service'
import { LabResultsController } from './lab-results.controller'
import { LabResult } from './entities/lab-result.entity'

@Module({
  imports: [TypeOrmModule.forFeature([LabResult])],
  controllers: [LabResultsController],
  providers: [LabResultsService],
  exports: [LabResultsService],
})
export class LabResultsModule {}

