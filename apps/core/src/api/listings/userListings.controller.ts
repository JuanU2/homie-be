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
  GetUserListingsQueryDto,
  UserListingDetailParamsDto,
  UserListingDetailDtoResponse,
  UserListingParamsDto,
} from '@/api/listings/dtos/listings.dto';
import { UserListingsPage } from '@/api/listings/domain/entity/listing';
import { ListingsService } from '@/api/listings/listings.service';

@Controller('users')
export class UserListingsController {
  constructor(
    private readonly listingsService: ListingsService,
  ) {}

  @Get(':userId/listings')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: "Get the user's own listings" })
  async getUserListings(
    @Req() request: Request,
    @Param() params: UserListingParamsDto,
    @Query() query: GetUserListingsQueryDto,
  ): Promise<UserListingsPage> {
    if (request.user!.userId !== params.userId) {
      throw new ForbiddenException(
        'You can only view your own listings',
      );
    }

    return this.listingsService.getUserListings(params.userId, {
      limit: query.limit,
      cursor: query.cursor,
      status: query.status,
    });
  }

  @Get(':userId/listings/:listingId')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({
    summary: "Get the user's own listing detail with applications",
  })
  async getUserListingDetail(
    @Req() request: Request,
    @Param() params: UserListingDetailParamsDto,
  ): Promise<UserListingDetailDtoResponse> {
    if (request.user!.userId !== params.userId) {
      throw new ForbiddenException(
        'You can only view your own listings',
      );
    }

    return this.listingsService.getUserListingDetail(
      params.userId,
      params.listingId,
    );
  }
}
