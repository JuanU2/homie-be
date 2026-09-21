import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { type Request } from 'express';
import {
  CreateRoommateApplicationDtoRequest,
  GetRoommateApplicationsQueryDto,
  RoommateApplicationDtoResponse,
  RoommateApplicationIdParamsDto,
  RoommateApplicationParamsDto,
  RoommateApplicationWithApplicantDtoResponse,
  UpdateRoommateApplicationDtoRequest,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import { RoommateApplicationsPage } from '@/api/roommateApplications/domain/entity/roommateApplication';
import { RoommateApplicationsService } from '@/api/roommateApplications/roommateApplications.service';

@Controller('roommate-applications')
export class RoommateApplicationsController {
  constructor(
    private readonly roommateApplicationsService: RoommateApplicationsService,
  ) {}

  @Post()
  @UseGuards(GoogleTokenGuard)
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
  @UseGuards(GoogleTokenGuard)
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

  @Put(':roommateApplicationId')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Update a roommate application status' })
  async updateRoommateApplicationStatus(
    @Req() request: Request,
    @Param() params: RoommateApplicationIdParamsDto,
    @Body() data: UpdateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplicationDtoResponse> {
    return this.roommateApplicationsService.updateRoommateApplicationStatus(
      request.user!.userId,
      params.roommateApplicationId,
      data,
    );
  }

  @Get(':roommateRequestId')
  @UseGuards(GoogleTokenGuard)
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
