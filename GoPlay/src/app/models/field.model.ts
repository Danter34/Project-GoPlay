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