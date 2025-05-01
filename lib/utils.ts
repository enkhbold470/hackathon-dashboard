import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define an interface for the debounced function with cancel method
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  const debouncedFn = ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }) as DebouncedFunction<T>

  // Add cancel method to the debounced function
  debouncedFn.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debouncedFn
}
