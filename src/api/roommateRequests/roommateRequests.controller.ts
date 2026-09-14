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
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';
import {
  CreateRoommateRequestDtoRequest,
  GetRoommateRequestsQueryDto,
  RoommateRequestDetailDtoResponse,
  RoommateRequestDtoResponse,
  RoommateRequestParamsDto,
  UpdateRoommateRequestDtoRequest,
} from '@/api/roommateRequests/dtos/roommateRequests.dto';
import { RoommateRequestsPage } from '@/api/roommateRequests/domain/entity/roommateRequest';
import { RoommateRequestsService } from '@/api/roommateRequests/roommateRequests.service';

@Controller('roommate-requests')
export class RoommateRequestsController {
  constructor(
    private readonly roommateRequestsService: RoommateRequestsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create roommate request' })
  async createRoommateRequest(
    @Req() request: Request,
    @Body() data: CreateRoommateRequestDtoRequest,
  ): Promise<RoommateRequestDtoResponse> {
    return this.roommateRequestsService.createRoommateRequest(
      request.user!.userId,
      data,
    );
  }

  @Get(':roommateRequestId')
  @ApiOperation({ summary: 'Get roommate request detail by id' })
  async getRoommateRequestDetail(
    @Param() params: RoommateRequestParamsDto,
  ): Promise<RoommateRequestDetailDtoResponse> {
    return this.roommateRequestsService.getRoommateRequestDetail(
      params.roommateRequestId,
    );
  }

  @Put(':roommateRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update roommate request' })
  async updateRoommateRequest(
    @Req() request: Request,
    @Param() params: RoommateRequestParamsDto,
    @Body() data: UpdateRoommateRequestDtoRequest,
  ): Promise<RoommateRequestDtoResponse> {
    return this.roommateRequestsService.updateRoommateRequest(
      request.user!.userId,
      params.roommateRequestId,
      data,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated roommate requests' })
  async getAllRoommateRequests(
    @Query() query: GetRoommateRequestsQueryDto,
  ): Promise<RoommateRequestsPage> {
    return this.roommateRequestsService.getRoommateRequests({
      limit: query.limit,
      cursor: query.cursor,
      lat: query.lat,
      lng: query.lng,
    });
  }
}
