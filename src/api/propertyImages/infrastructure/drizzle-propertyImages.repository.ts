import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { propertyImages } from "@/db/schema";
import * as schema from "@/db/schema";
import { IPropertyImagesRepository } from "@/api/propertyImages/domain/interface/propertyImages.repository";
import {
  CreatePropertyImageModel,
  PropertyImage,
} from "@/api/propertyImages/domain/entity/propertyImage";

@Injectable()
export class DrizzlePropertyImagesRepository implements IPropertyImagesRepository {
  constructor(
    @Inject("DRIZZLE_DB")
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createImage(image: CreatePropertyImageModel): Promise<PropertyImage> {
    const [created] = await this.db
      .insert(propertyImages)
      .values({
        propertyId: image.propertyId,
        imageUrl: image.imageUrl,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create property image");
    }

    return {
      id: created.id,
      propertyId: created.propertyId,
      imageUrl: created.imageUrl ?? image.imageUrl,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}
