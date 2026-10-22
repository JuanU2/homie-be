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
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { type Request } from 'express';
import {
  GetRoommateApplicationsQueryDto,
  RoommateApplicationsWithApplicantPageDtoResponse,
  UserRoommateApplicationsParamsDto,
} from '@/api/roommateApplications/dtos/roommateApplications.dto';
import { RoommateApplicationsService } from '@/api/roommateApplications/roommateApplications.service';

@Controller('users')
export class UserRoommateApplicationsController {
  constructor(
    private readonly roommateApplicationsService: RoommateApplicationsService,
  ) {}

  @Get(':userId/listing-applications')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({
    summary: "Get all applications for the user's own listings",
  })
  async getUserListingApplications(
    @Req() request: Request,
    @Param() params: UserRoommateApplicationsParamsDto,
    @Query() query: GetRoommateApplicationsQueryDto,
  ): Promise<RoommateApplicationsWithApplicantPageDtoResponse> {
    if (request.user!.userId !== params.userId) {
      throw new ForbiddenException(
        'You can only view applications for your own listings',
      );
    }

    return this.roommateApplicationsService.getRoommateApplicationsForOwner(
      params.userId,
      { limit: query.limit, cursor: query.cursor, status: query.status },
    );
  }
}
