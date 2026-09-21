import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam } from "@nestjs/swagger";
import { type Request, type Response } from "express";
import { GoogleTokenGuard } from "@/api/auth/google-token.guard";
import { PropertyImagesService } from "./propertyImages.service";
import {
  PropertyImageParamsDto,
  PropertyImageResponse,
  PropertyImagesParamsDto,
  UpdatePropertyImageDto,
} from "./dtos/propertyImages.dto";

@Controller("properties/:propertyId/images")
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @UseGuards(GoogleTokenGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload a property image" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "propertyId", type: String, description: "Property id" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        title: {
          type: "boolean",
        },
      },
      required: ["file"],
    },
  })
  async uploadImage(
    @Req() request: Request,
    @Param() params: PropertyImagesParamsDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PropertyImageResponse> {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.propertyImagesService.uploadImage(
      userId,
      params.propertyId,
      file,
      this.parseTitle(request.body?.title),
    );
  }

  private parseTitle(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === "boolean") return value;
    return value === "true" || value === "1" || value === "yes";
  }

  @Get(":imageId")
  @ApiOperation({ summary: "Get a property image" })
  @ApiParam({ name: "propertyId", type: String, description: "Property id" })
  @ApiParam({ name: "imageId", type: String, description: "Image id" })
  async getImage(
    @Param() params: PropertyImageParamsDto,
    @Res() res: Response,
  ): Promise<void> {
    const { body, contentType } = await this.propertyImagesService.getImage(
      params.propertyId,
      params.imageId,
    );

    res.setHeader("Content-Type", contentType);
    res.send(body);
  }

  @Delete(":imageId")
  @UseGuards(GoogleTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a property image" })
  @ApiParam({ name: "propertyId", type: String, description: "Property id" })
  @ApiParam({ name: "imageId", type: String, description: "Image id" })
  async deleteImage(
    @Req() request: Request,
    @Param() params: PropertyImageParamsDto,
  ): Promise<void> {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    await this.propertyImagesService.deleteImage(
      userId,
      params.propertyId,
      params.imageId,
    );
  }

  @Patch(":imageId")
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: "Update a property image" })
  @ApiParam({ name: "propertyId", type: String, description: "Property id" })
  @ApiParam({ name: "imageId", type: String, description: "Image id" })
  async updateImage(
    @Req() request: Request,
    @Param() params: PropertyImageParamsDto,
    @Body() updatePropertyImageDto: UpdatePropertyImageDto,
  ): Promise<PropertyImageResponse> {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.propertyImagesService.setImageTitle(
      userId,
      params.propertyId,
      params.imageId,
      updatePropertyImageDto.title,
    );
  }
}
