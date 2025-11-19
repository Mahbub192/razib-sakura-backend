import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { HomePageContentService } from './home-page-content.service'
import { UpdateHomePageContentDto } from './dto/update-home-page-content.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('home-page-content')
@Controller('home-page-content')
export class HomePageContentController {
  constructor(private readonly homePageContentService: HomePageContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get home page content (Public)' })
  @ApiResponse({ status: 200, description: 'Home page content retrieved successfully' })
  getContent() {
    return this.homePageContentService.getContent()
  }

  @Patch()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update home page content (Protected)' })
  @ApiResponse({ status: 200, description: 'Home page content updated successfully' })
  updateContent(@Body() updateDto: UpdateHomePageContentDto) {
    return this.homePageContentService.updateContent(updateDto)
  }
}

