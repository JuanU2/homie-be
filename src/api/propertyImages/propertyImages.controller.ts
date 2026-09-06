import {
  Controller,
  Get,
  Param,
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
import { JwtAuthGuard } from "@/api/auth/jwt-auth.guard";
import { PropertyImagesService } from "./propertyImages.service";
import {
  PropertyImageParamsDto,
  PropertyImageResponse,
  PropertyImagesParamsDto,
} from "./dtos/propertyImages.dto";

@Controller("properties/:propertyId/images")
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
}
