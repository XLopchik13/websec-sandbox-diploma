export interface User {
  id: number;
  email: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface ApiError {
  detail: string;
}
