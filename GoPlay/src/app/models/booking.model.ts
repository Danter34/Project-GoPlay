export interface TimeSlot {
  slotId: number;
  startTime: string; 
  endTime: string;
  isActive: boolean;
}

export interface BookingCreateDTO {
  fieldId: number;
  bookingDate: string; 
  slotIds: number[];
  
  // --- MỚI: Thông tin khách vãng lai ---
  guestName?: string;
  guestPhone?: string;
}

export interface Booking {
  bookingId: number;
  bookingDate: string;
  status: string;
  totalPrice: number;
  fieldId: number;
  slotIds: number[];
  fieldName: string;      // [MỚI]
  hasReviewed: boolean;
  bookingTimeSlots?: { slotId: number }[]; 
}

export interface BookingTimeSlotDTO {
  startTime: string; // Backend trả về TimeSpan sẽ thành string "HH:mm:ss"
  endTime: string;
}

export interface BookingResponse {
  bookingId: number;
  bookingDate: string;
  status: string;
  totalPrice: number;
  fieldId: number;
  fieldName: string;      // [MỚI]
  hasReviewed: boolean;   // [MỚI]
  timeSlots: BookingTimeSlotDTO[]; // [MỚI] Thay vì slotIds
}