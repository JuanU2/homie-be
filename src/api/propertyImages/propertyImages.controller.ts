import {
  Controller,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam } from "@nestjs/swagger";
import { type Request } from "express";
import { JwtAuthGuard } from "@/api/auth/jwt-auth.guard";
import { PropertyImagesService } from "./propertyImages.service";
import { PropertyImageResponse } from "./dtos/propertyImages.dto";

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
      },
      required: ["file"],
    },
  })
  async uploadImage(
    @Req() request: Request,
    @Param("propertyId") propertyId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PropertyImageResponse> {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.propertyImagesService.uploadImage(userId, propertyId, file);
  }
}
