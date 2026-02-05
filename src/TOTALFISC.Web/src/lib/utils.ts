import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import debur from 'lodash.deburr'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeString(str: string) {
  return debur(str).toLowerCase()
}
