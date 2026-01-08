export interface Field {
  fieldId: number;
  fieldName: string;
  price: number;
  status: string;
  sportName: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  averageRating: number;
  totalReviews: number;
  images: string[];
}

export interface FieldCreateDTO {
  fieldName: string;
  price: number;
  sportTypeId: number;
  location: {
    city: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  images?: File[]; // Dùng để gửi file lên API
}
export interface FieldUpdateDTO extends FieldCreateDTO {
  deleteImageIds?: number[];
  newImages?: File[];
}