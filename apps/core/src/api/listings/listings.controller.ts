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
import { OptionalGoogleTokenGuard } from '@/api/auth/optional-google-token.guard';
import { type Request } from 'express';
import {
  CreateListingDtoRequest,
  GetListingsQueryDto,
  ListingDetailDtoResponse,
  ListingDtoResponse,
  ListingParamsDto,
  UpdateListingDtoRequest,
  UpdateListingStatusDtoRequest,
} from '@/api/listings/dtos/listings.dto';
import { ListingsPage } from '@/api/listings/domain/entity/listing';
import { ListingsService } from '@/api/listings/listings.service';

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
  ) {}

  @Post()
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Create listing' })
  async createListing(
    @Req() request: Request,
    @Body() data: CreateListingDtoRequest,
  ): Promise<ListingDtoResponse> {
    return this.listingsService.createListing(
      request.user!.userId,
      data,
    );
  }

  @Get(':listingId')
  @UseGuards(OptionalGoogleTokenGuard)
  @ApiOperation({ summary: 'Get listing detail by id' })
  async getListingDetail(
    @Req() request: Request,
    @Param() params: ListingParamsDto,
  ): Promise<ListingDetailDtoResponse> {
    return this.listingsService.getListingDetail(
      params.listingId,
      request.user?.userId,
    );
  }

  @Put(':listingId')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Update listing' })
  async updateListing(
    @Req() request: Request,
    @Param() params: ListingParamsDto,
    @Body() data: UpdateListingDtoRequest,
  ): Promise<ListingDtoResponse> {
    return this.listingsService.updateListing(
      request.user!.userId,
      params.listingId,
      data,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated listings' })
  async getAllListings(
    @Query() query: GetListingsQueryDto,
  ): Promise<ListingsPage> {
    return this.listingsService.getListings({
      limit: query.limit,
      cursor: query.cursor,
      lat: query.lat,
      lng: query.lng,
      priceFrom: query.priceFrom,
      priceTo: query.priceTo,
      equipment: query.equipment,
      rooms: query.rooms,
      sortBy: query.sortBy,
      preferredGender: query.preferredGender,
    });
  }

  @Put(':listingId/status')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Update listing status' })
  async updateListingStatus(
    @Req() request: Request,
    @Param() params: ListingParamsDto,
    @Body() data: UpdateListingStatusDtoRequest,
  ): Promise<ListingDtoResponse> {
    return this.listingsService.updateListingStatus(
      request.user!.userId,
      params.listingId,
      data,
    );
  }
}
