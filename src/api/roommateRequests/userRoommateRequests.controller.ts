import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/api/auth/jwt-auth.guard';
import { type Request } from 'express';
import {
  GetUserRoommateRequestsQueryDto,
  UserRoommateRequestDetailParamsDto,
  UserRoommateRequestDetailDtoResponse,
  UserRoommateRequestParamsDto,
} from '@/api/roommateRequests/dtos/roommateRequests.dto';
import { UserRoommateRequestsPage } from '@/api/roommateRequests/domain/entity/roommateRequest';
import { RoommateRequestsService } from '@/api/roommateRequests/roommateRequests.service';

@Controller('users')
export class UserRoommateRequestsController {
  constructor(
    private readonly roommateRequestsService: RoommateRequestsService,
  ) {}

  @Get(':userId/roommate-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the user's own roommate requests" })
  async getUserRoommateRequests(
    @Req() request: Request,
    @Param() params: UserRoommateRequestParamsDto,
    @Query() query: GetUserRoommateRequestsQueryDto,
  ): Promise<UserRoommateRequestsPage> {
    if (request.user!.userId !== params.userId) {
      throw new ForbiddenException(
        'You can only view your own roommate requests',
      );
    }

    return this.roommateRequestsService.getUserRoommateRequests(params.userId, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Get(':userId/roommate-requests/:roommateRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get the user's own roommate request detail with applications",
  })
  async getUserRoommateRequestDetail(
    @Req() request: Request,
    @Param() params: UserRoommateRequestDetailParamsDto,
  ): Promise<UserRoommateRequestDetailDtoResponse> {
    if (request.user!.userId !== params.userId) {
      throw new ForbiddenException(
        'You can only view your own roommate requests',
      );
    }

    return this.roommateRequestsService.getUserRoommateRequestDetail(
      params.userId,
      params.roommateRequestId,
    );
  }
}
