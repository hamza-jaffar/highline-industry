import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string) {
  try {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy text");
  }
}