import { FieldImage } from "./field-image";

export interface Field {
  ownerId: number;
  fieldId: number;
  fieldName: string;
  price: number;
  status: string;
  sportName: string;
  sportTypeId?: number; 
  address?: string;
  description?: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  averageRating: number;
  totalReviews: number;
  images: FieldImage[];
}


export interface FieldCreateDTO {
  fieldName: string;
  description?: string;
  price: number;
  sportTypeId: number;
  location: {
    city: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  images?: File[];
}

export interface FieldUpdateDTO extends FieldCreateDTO {
  deleteImageIds?: number[];
  newImages?: File[];
}