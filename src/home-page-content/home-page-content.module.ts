import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HomePageContent } from './entities/home-page-content.entity'
import { HomePageContentService } from './home-page-content.service'
import { HomePageContentController } from './home-page-content.controller'

@Module({
  imports: [TypeOrmModule.forFeature([HomePageContent])],
  controllers: [HomePageContentController],
  providers: [HomePageContentService],
  exports: [HomePageContentService],
})
export class HomePageContentModule {}

