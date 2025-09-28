import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = "https://rating-app-5o6d.onrender.com";

export function configure(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
