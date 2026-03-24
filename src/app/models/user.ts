// src/app/models/user.ts
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  faceId?: string;
  faceRegistered: boolean;
  createdAt: Date;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  requiresFace?: boolean;
}