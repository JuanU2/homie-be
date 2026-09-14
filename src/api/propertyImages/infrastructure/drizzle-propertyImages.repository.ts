import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
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
    return this.db.transaction(async tx => {
      if (image.title) {
        await tx
          .update(propertyImages)
          .set({ title: false })
          .where(
            and(
              eq(propertyImages.propertyId, image.propertyId),
              eq(propertyImages.title, true),
            ),
          );
      }

      const [created] = await tx
        .insert(propertyImages)
        .values({
          propertyId: image.propertyId,
          imageUrl: image.imageUrl,
          title: image.title,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create property image");
      }

      return {
        id: created.id,
        propertyId: created.propertyId,
        imageUrl: created.imageUrl ?? image.imageUrl,
        title: created.title,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    });
  }

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    await this.db
      .delete(propertyImages)
      .where(
        and(
          eq(propertyImages.id, imageId),
          eq(propertyImages.propertyId, propertyId),
        ),
      );
  }

  async setImageTitle(
    propertyId: string,
    imageId: string,
    title: boolean,
  ): Promise<PropertyImage | undefined> {
    return this.db.transaction(async tx => {
      if (title) {
        await tx
          .update(propertyImages)
          .set({ title: false })
          .where(
            and(
              eq(propertyImages.propertyId, propertyId),
              eq(propertyImages.title, true),
            ),
          );
      }

      const [updated] = await tx
        .update(propertyImages)
        .set({ title, updatedAt: new Date() })
        .where(
          and(
            eq(propertyImages.id, imageId),
            eq(propertyImages.propertyId, propertyId),
          ),
        )
        .returning();

      if (!updated) {
        return undefined;
      }

      return {
        id: updated.id,
        propertyId: updated.propertyId,
        imageUrl: updated.imageUrl ?? "",
        title: updated.title,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  }

  async getImageById(
    propertyId: string,
    imageId: string,
  ): Promise<PropertyImage | undefined> {
    const [image] = await this.db
      .select()
      .from(propertyImages)
      .where(
        and(
          eq(propertyImages.id, imageId),
          eq(propertyImages.propertyId, propertyId),
        ),
      )
      .limit(1);

    if (!image) {
      return undefined;
    }

    return {
      id: image.id,
      propertyId: image.propertyId,
      imageUrl: image.imageUrl ?? "",
      title: image.title,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
