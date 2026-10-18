import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleTokenGuard } from '@/api/auth/google-token.guard';
import { type Request } from 'express';
import type { FavouritesPage } from '@/api/favourites/domain/entity/favourite';
import {
  CreateFavouriteDtoRequest,
  FavouriteDtoResponse,
  FavouriteParamsDto,
  GetFavouritesQueryDto,
} from '@/api/favourites/dtos/favourites.dto';
import { FavouritesService } from '@/api/favourites/favourites.service';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: "Get the authenticated user's favourite roommate requests" })
  async getFavourites(
    @Req() request: Request,
    @Query() query: GetFavouritesQueryDto,
  ): Promise<FavouritesPage> {
    return this.favouritesService.getFavourites(request.user!.userId, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Post()
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Add a roommate request to favourites' })
  async createFavourite(
    @Req() request: Request,
    @Body() data: CreateFavouriteDtoRequest,
  ): Promise<FavouriteDtoResponse> {
    return this.favouritesService.create(
      request.user!.userId,
      data.roommateRequestId,
    );
  }

  @Delete(':roommateRequestId')
  @UseGuards(GoogleTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a roommate request from favourites' })
  async deleteFavourite(
    @Req() request: Request,
    @Param() params: FavouriteParamsDto,
  ): Promise<void> {
    await this.favouritesService.delete(
      request.user!.userId,
      params.roommateRequestId,
    );
  }
}
