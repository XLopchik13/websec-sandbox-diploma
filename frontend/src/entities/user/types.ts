export interface User {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
}

export interface ApiError {
  detail: string;
}
