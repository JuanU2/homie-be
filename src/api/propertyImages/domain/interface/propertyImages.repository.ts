import {
  CreatePropertyImageModel,
  PropertyImage,
} from "@/api/propertyImages/domain/entity/propertyImage";

export interface IPropertyImagesRepository {
  createImage(image: CreatePropertyImageModel): Promise<PropertyImage>;
}

export const PROPERTY_IMAGES_REPOSITORY = Symbol("PROPERTY_IMAGES_REPOSITORY");
