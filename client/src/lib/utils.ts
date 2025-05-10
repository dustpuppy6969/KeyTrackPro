import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date | string | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'Just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function getDeviceId(): string {
  // Try to get device ID from localStorage
  let deviceId = localStorage.getItem('deviceId');
  
  // If not found, generate a new one and save it
  if (!deviceId) {
    fetch('/api/generate-device-id')
      .then(res => res.json())
      .then(data => {
        deviceId = data.deviceId;
        localStorage.setItem('deviceId', deviceId);
      })
      .catch(err => {
        console.error('Error generating device ID:', err);
        // Generate a fallback ID
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      });
    
    // Return a temporary ID while we're fetching
    return 'temporary-id';
  }
  
  return deviceId;
}

export function generateKeyPrefix(): string {
  const prefixes = ['A', 'B', 'C', 'D', 'E', 'F'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
  
  return `${randomPrefix}${randomNumber}`;
}

export function getKeyStatus(lastVerified: Date | string | null): 'verified' | 'missing' {
  if (!lastVerified) return 'missing';
  
  const now = new Date();
  const lastVerifiedDate = typeof lastVerified === 'string' 
    ? new Date(lastVerified) 
    : lastVerified;
  
  const hoursSinceVerification = 
    (now.getTime() - lastVerifiedDate.getTime()) / (1000 * 60 * 60);
  
  // Consider a key missing if it hasn't been verified in 24 hours
  return hoursSinceVerification < 24 ? 'verified' : 'missing';
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
