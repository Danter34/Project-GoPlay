export interface OwnerProfile {
  ownerProfileId: number;
  userId: number;
  identityNumber: string; 
  taxCode?: string;
  phone: string;
  businessName: string;
  status: string; 
  createdAt: string;
}

export interface OwnerProfileUpdateDTO {
  phone: string;
  businessName: string;
  taxCode?: string;
  identityNumber: string;
}