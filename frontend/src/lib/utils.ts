import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildQueryString(params: Record<string, unknown>): string {
  const queryString = Object.keys(params)
    .flatMap((key) => {
      if (params[key] === undefined) return [];

      const value = params[key];
      return `${key}=${encodeURI(String(value))}`;
    })
    .join("&");

  return queryString;
}
