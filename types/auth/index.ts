import { z } from "zod";
import { User } from "@/types/user";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  username: string;
  gender: number;
  age: number;
}

export interface RegisterResponse {
  user: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export * from "./login";