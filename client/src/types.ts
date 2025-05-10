import { Key, Setting, Verification, PendingVerification } from "@shared/schema";

export interface KeyWithStatus extends Key {
  isVerified?: boolean;
  isMissing?: boolean;
  isPending?: boolean;
}

export interface ActivityItem {
  id: number;
  keyNumber: string;
  status: 'verified' | 'pending' | 'missing';
  timestamp: string;
  timeAgo: string;
}

export interface ScanResult {
  keyId?: number;
  keyNumber?: string;
  success: boolean;
  message: string;
}

export type TabName = 'home' | 'scan' | 'keys' | 'admin';
