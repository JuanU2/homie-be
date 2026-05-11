import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';
import {
  CreateRoommateRequestDtoRequest,
  RoommateRequestDtoResponse,
} from '@/api/roommateRequests/dtos/roommateRequests.dto';
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
  @ApiOperation({ summary: 'Get all roommate requests' })
  async getAllRoommateRequests(): Promise<RoommateRequestDtoResponse[]> {
    return this.roommateRequestsService.getAllRoommateRequests();
  }
}
