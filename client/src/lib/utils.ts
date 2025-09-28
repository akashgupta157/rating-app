import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = "http://localhost:3000";

export function configure(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
