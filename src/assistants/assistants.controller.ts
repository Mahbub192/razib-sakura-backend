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
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AssistantsService } from './assistants.service'
import { CreateAssistantDto } from './dto/create-assistant.dto'
import { UpdateAssistantDto } from './dto/update-assistant.dto'
import { CreateShiftDto } from './dto/create-shift.dto'
import { UpdateShiftDto } from './dto/update-shift.dto'
import { UpdateAssistantProfileDto } from './dto/update-assistant-profile.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('assistants')
@ApiBearerAuth('JWT-auth')
@Controller('assistants')
@UseGuards(JwtAuthGuard)
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assistant' })
  @ApiResponse({ status: 201, description: 'Assistant created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAssistantDto: CreateAssistantDto) {
    return this.assistantsService.create(createAssistantDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all assistants' })
  @ApiResponse({ status: 200, description: 'List of assistants' })
  findAll() {
    return this.assistantsService.findAll()
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get assistant profile' })
  @ApiResponse({ status: 200, description: 'Assistant profile' })
  getProfile(@Request() req) {
    return this.assistantsService.findOne(req.user.id)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get assistant dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  getDashboard(@Request() req) {
    return this.assistantsService.getDashboard(req.user.id)
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get assistant appointments' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'filterType', required: false, enum: ['upcoming', 'past', 'all'] })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  getAppointments(
    @Request() req,
    @Query('status') status?: string,
    @Query('filterType') filterType?: 'upcoming' | 'past' | 'all',
  ) {
    return this.assistantsService.getAppointments(req.user.id, status, filterType)
  }

  @Get('appointments/statistics')
  @ApiOperation({ summary: 'Get assistant appointment statistics' })
  @ApiResponse({ status: 200, description: 'Appointment statistics' })
  getAppointmentStatistics(@Request() req) {
    return this.assistantsService.getAppointmentStatistics(req.user.id)
  }

  @Get('patients')
  @ApiOperation({ summary: 'Get assistant patients' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of patients with pagination' })
  getPatients(
    @Request() req,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.assistantsService.getPatients(req.user.id, search, pageNum, limitNum)
  }

  @Get('patients/statistics')
  @ApiOperation({ summary: 'Get assistant patient statistics' })
  @ApiResponse({ status: 200, description: 'Patient statistics' })
  getPatientStatistics(@Request() req) {
    return this.assistantsService.getPatientStatistics(req.user.id)
  }

  @Get('patients/:patientId')
  @ApiOperation({ summary: 'Get patient details with history' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  getPatientDetails(@Request() req, @Param('patientId') patientId: string) {
    return this.assistantsService.getPatientDetails(req.user.id, patientId)
  }

  @Get('appointments/range')
  @ApiOperation({ summary: 'Get appointments by date range for calendar' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Appointments in date range' })
  getAppointmentsByRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.assistantsService.getAppointmentsByDateRange(req.user.id, startDate, endDate)
  }

  @Get('appointments/today')
  @ApiOperation({ summary: 'Get today appointments for calendar sidebar' })
  @ApiResponse({ status: 200, description: "Today's appointments" })
  getTodayAppointments(@Request() req) {
    return this.assistantsService.getTodayAppointments(req.user.id)
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get assistant reports and analytics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reports data' })
  getReports(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.assistantsService.getReports(req.user.id, startDate, endDate)
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get assistant conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  getMessages(@Request() req) {
    return this.assistantsService.getMessages(req.user.id)
  }

  @Get('messages/:conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  getConversationMessages(@Request() req, @Param('conversationId') conversationId: string) {
    return this.assistantsService.getConversationMessages(req.user.id, conversationId)
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update assistant profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@Request() req, @Body() updateDto: UpdateAssistantProfileDto) {
    return this.assistantsService.updateProfile(req.user.id, updateDto)
  }

  @Get('profile/notifications')
  @ApiOperation({ summary: 'Get assistant notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences' })
  getNotificationPreferences(@Request() req) {
    return this.assistantsService.getNotificationPreferences(req.user.id)
  }

  @Patch('profile/notifications')
  @ApiOperation({ summary: 'Update assistant notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  updateNotificationPreferences(@Request() req, @Body() preferences: any) {
    return this.assistantsService.updateNotificationPreferences(req.user.id, preferences)
  }

  @Get('profile/clinic')
  @ApiOperation({ summary: 'Get assistant clinic information' })
  @ApiResponse({ status: 200, description: 'Clinic information' })
  getClinicInfo(@Request() req) {
    return this.assistantsService.getClinicInfo(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assistant by ID' })
  @ApiResponse({ status: 200, description: 'Assistant details' })
  @ApiResponse({ status: 404, description: 'Assistant not found' })
  findOne(@Param('id') id: string) {
    return this.assistantsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update assistant' })
  @ApiResponse({ status: 200, description: 'Assistant updated successfully' })
  @ApiResponse({ status: 404, description: 'Assistant not found' })
  update(@Param('id') id: string, @Body() updateAssistantDto: UpdateAssistantDto) {
    return this.assistantsService.update(id, updateAssistantDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete assistant' })
  @ApiResponse({ status: 200, description: 'Assistant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assistant not found' })
  remove(@Param('id') id: string) {
    return this.assistantsService.remove(id)
  }

  // Shift Management Endpoints
  @Get(':id/shifts')
  @ApiOperation({ summary: 'Get assistant shifts' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of shifts' })
  getShifts(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.assistantsService.getShifts(id, start, end)
  }

  @Post(':id/shifts')
  @ApiOperation({ summary: 'Create assistant shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  createShift(@Param('id') id: string, @Body() createShiftDto: CreateShiftDto) {
    return this.assistantsService.createShift({
      ...createShiftDto,
      assistantId: id,
    })
  }

  @Get('shifts/:shiftId')
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiResponse({ status: 200, description: 'Shift details' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  getShift(@Param('shiftId') shiftId: string) {
    return this.assistantsService.findShiftById(shiftId)
  }

  @Patch('shifts/:shiftId')
  @ApiOperation({ summary: 'Update shift' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  updateShift(@Param('shiftId') shiftId: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.assistantsService.updateShift(shiftId, updateShiftDto)
  }

  @Delete('shifts/:shiftId')
  @ApiOperation({ summary: 'Delete shift' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  deleteShift(@Param('shiftId') shiftId: string) {
    return this.assistantsService.deleteShift(shiftId)
  }

  // Get all shifts (for schedule management)
  @Get('shifts/all/list')
  @ApiOperation({ summary: 'Get all shifts with filters' })
  @ApiQuery({ name: 'assistantId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'clinicLocation', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of all shifts' })
  getAllShifts(
    @Query('assistantId') assistantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clinicLocation') clinicLocation?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.assistantsService.getShifts(assistantId, start, end, clinicLocation)
  }
}

