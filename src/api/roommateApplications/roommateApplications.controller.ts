import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';
import {
  CreateRoommateApplicationDtoRequest,
  GetRoommateApplicationsQueryDto,
  RoommateApplicationDtoResponse,
  RoommateApplicationParamsDto,
  RoommateApplicationWithApplicantDtoResponse,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import { RoommateApplicationsPage } from '@/api/roommateApplications/domain/entity/roommateApplication';
import { RoommateApplicationsService } from '@/api/roommateApplications/roommateApplications.service';

@Controller('roommate-applications')
export class RoommateApplicationsController {
  constructor(
    private readonly roommateApplicationsService: RoommateApplicationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply for a roommate request' })
  async createRoommateApplication(
    @Req() request: Request,
    @Body() data: CreateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplicationDtoResponse> {
    return this.roommateApplicationsService.createRoommateApplication(
      request.user!.userId,
      data,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the owner's roommate applications" })
  async getRoommateApplications(
    @Req() request: Request,
    @Query() query: GetRoommateApplicationsQueryDto,
  ): Promise<RoommateApplicationsPage> {
    return this.roommateApplicationsService.getRoommateApplications(
      request.user!.userId,
      { limit: query.limit, cursor: query.cursor, status: query.status },
    );
  }

  @Get(':roommateRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all roommate applications for a roommate request',
  })
  async getRoommateApplicationsForRequest(
    @Req() request: Request,
    @Param() params: RoommateApplicationParamsDto,
  ): Promise<RoommateApplicationWithApplicantDtoResponse[]> {
    return this.roommateApplicationsService.getRoommateApplicationsForRequest(
      request.user!.userId,
      params.roommateRequestId,
    );
  }
}
