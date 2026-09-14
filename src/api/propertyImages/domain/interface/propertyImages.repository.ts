import {
  CreatePropertyImageModel,
  PropertyImage,
} from "@/api/propertyImages/domain/entity/propertyImage";

export interface IPropertyImagesRepository {
  createImage(image: CreatePropertyImageModel): Promise<PropertyImage>;
  getImageById(
    propertyId: string,
    imageId: string,
  ): Promise<PropertyImage | undefined>;
  deleteImage(propertyId: string, imageId: string): Promise<void>;
  setImageTitle(
    propertyId: string,
    imageId: string,
    title: boolean,
  ): Promise<PropertyImage | undefined>;
}

export const PROPERTY_IMAGES_REPOSITORY = Symbol("PROPERTY_IMAGES_REPOSITORY");
