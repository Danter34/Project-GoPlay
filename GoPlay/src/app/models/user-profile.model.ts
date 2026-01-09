export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

export interface UpdateUserProfileDTO {
  fullName: string;
  phone?: string;
  email: string;
}
export interface ChangePasswordDTO{
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}