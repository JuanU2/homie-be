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
  CreateRoommateRequestDtoRequest,
  RoommateRequestDtoResponse,
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

  @Get(':id')
  @ApiOperation({ summary: 'Get roommate request by id' })
  async getRoommateRequestById(
    @Param('id') id: string,
  ): Promise<RoommateRequestDtoResponse | undefined> {
    return this.roommateRequestsService.getRoommateRequestById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated roommate requests' })
  async getAllRoommateRequests(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): Promise<RoommateRequestsPage> {
    const resolvedLimit = limit
      ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
      : 20;

    return this.roommateRequestsService.getRoommateRequests({
      limit: resolvedLimit,
      cursor,
      lat: lat !== undefined && !Number.isNaN(Number(lat)) ? Number(lat) : undefined,
      lng: lng !== undefined && !Number.isNaN(Number(lng)) ? Number(lng) : undefined,
    });
  }
}
