
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a function to generate unique IDs for toast
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}
