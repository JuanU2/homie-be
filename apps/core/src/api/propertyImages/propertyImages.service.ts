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
    file: Express.Multer.File | undefined,
    title: boolean,
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
      title,
    });
  }

  async uploadImageFromUrl(
    userId: string,
    propertyId: string,
    imageUrl: string,
    title: boolean,
  ): Promise<PropertyImage> {
    const ownerId = await this.propertiesRepository.getOwnerId(propertyId);
    if (!ownerId) {
      throw new NotFoundException("Property not found");
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "You can only upload images for your own property",
      );
    }

    const { buffer, contentType } = await this.downloadImage(imageUrl);

    const extension = IMAGE_EXTENSIONS[contentType] ?? "bin";
    const key = `properties/${propertyId}/${randomUUID()}.${extension}`;

    await this.storageService.upload(key, buffer, contentType);

    return this.propertyImagesRepository.createImage({
      propertyId,
      imageUrl: key,
      title,
    });
  }

  private async downloadImage(
    url: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new BadRequestException("Only http and https URLs are supported");
    }

    const response = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {
      throw new BadRequestException("Could not download the image from the URL");
    });

    if (!response.ok) {
      throw new BadRequestException(
        `Failed to download the image (HTTP ${response.status})`,
      );
    }

    const rawContentType = response.headers.get("content-type") ?? "";
    const contentType = rawContentType.split(";")[0].trim().toLowerCase();

    if (!contentType.startsWith("image/")) {
      throw new BadRequestException("Downloaded content is not an image");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
  }

  async getImage(
    propertyId: string,
    imageId: string,
  ): Promise<{ body: Buffer; contentType: string }> {
    const image = await this.propertyImagesRepository.getImageById(
      propertyId,
      imageId,
    );

    if (!image || !image.imageUrl) {
      throw new NotFoundException("Image not found");
    }

    return this.storageService.get(image.imageUrl);
  }

  async deleteImage(
    userId: string,
    propertyId: string,
    imageId: string,
  ): Promise<void> {
    const ownerId = await this.propertiesRepository.getOwnerId(propertyId);
    if (!ownerId) {
      throw new NotFoundException("Property not found");
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "You can only delete images for your own property",
      );
    }

    const image = await this.propertyImagesRepository.getImageById(
      propertyId,
      imageId,
    );

    if (!image) {
      throw new NotFoundException("Image not found");
    }

    if (image.imageUrl) {
      await this.storageService.delete(image.imageUrl);
    }

    await this.propertyImagesRepository.deleteImage(propertyId, imageId);
  }

  async setImageTitle(
    userId: string,
    propertyId: string,
    imageId: string,
    title: boolean,
  ): Promise<PropertyImage> {
    const ownerId = await this.propertiesRepository.getOwnerId(propertyId);
    if (!ownerId) {
      throw new NotFoundException("Property not found");
    }
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "You can only update images for your own property",
      );
    }

    const updated = await this.propertyImagesRepository.setImageTitle(
      propertyId,
      imageId,
      title,
    );

    if (!updated) {
      throw new NotFoundException("Image not found");
    }

    return updated;
  }
}
