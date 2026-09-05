import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { StorageService } from "@/storage/storage.service";
import {
  PROPERTY_IMAGES_REPOSITORY,
  type IPropertyImagesRepository,
} from "./domain/interface/propertyImages.repository";
import {
  PROPERTIES_REPOSITORY,
  type IPropertiesRepository,
} from "@/api/properties/domain/interface/properties.repository";
import type { PropertyImage } from "./domain/entity/propertyImage";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

@Injectable()
export class PropertyImagesService {
  constructor(
    @Inject(PROPERTY_IMAGES_REPOSITORY)
    private readonly propertyImagesRepository: IPropertyImagesRepository,
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: IPropertiesRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadImage(
    userId: string,
    propertyId: string,
    file?: Express.Multer.File,
  ): Promise<PropertyImage> {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Uploaded file must be an image");
    }

    const ownerId = await this.propertiesRepository.getOwnerId(propertyId);
    if (!ownerId) {
      throw new NotFoundException("Property not found");
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "You can only upload images for your own property",
      );
    }

    const extension = IMAGE_EXTENSIONS[file.mimetype] ?? "bin";
    const key = `properties/${propertyId}/${randomUUID()}.${extension}`;

    await this.storageService.upload(key, file.buffer, file.mimetype);

    return this.propertyImagesRepository.createImage({
      propertyId,
      imageUrl: key,
    });
  }
}
