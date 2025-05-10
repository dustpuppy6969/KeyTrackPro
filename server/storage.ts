import { 
  keys, 
  verifications, 
  settings, 
  pendingVerifications,
  type Key, 
  type InsertKey, 
  type Verification, 
  type InsertVerification,
  type Setting,
  type InsertSetting,
  type PendingVerification,
  type InsertPendingVerification
} from "@shared/schema";

export interface IStorage {
  // Keys
  getAllKeys(): Promise<Key[]>;
  getKey(id: number): Promise<Key | undefined>;
  getKeyByNumber(keyNumber: string): Promise<Key | undefined>;
  createKey(key: InsertKey): Promise<Key>;
  updateKey(id: number, key: Partial<Key>): Promise<Key | undefined>;
  deleteKey(id: number): Promise<boolean>;
  
  // Verifications
  getVerifications(keyId?: number): Promise<Verification[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  
  // Settings
  getSettings(deviceId: string): Promise<Setting | undefined>;
  createSettings(setting: InsertSetting): Promise<Setting>;
  updateSettings(id: number, setting: Partial<Setting>): Promise<Setting | undefined>;
  
  // Pending Verifications
  getPendingVerifications(): Promise<PendingVerification[]>;
  getActivePendingVerification(): Promise<PendingVerification | undefined>;
  createPendingVerification(verification: InsertPendingVerification): Promise<PendingVerification>;
  completePendingVerification(id: number): Promise<PendingVerification | undefined>;
}

export class MemStorage implements IStorage {
  private keysData: Map<number, Key>;
  private verificationsData: Map<number, Verification>;
  private settingsData: Map<number, Setting>;
  private pendingVerificationsData: Map<number, PendingVerification>;
  private keyIdCounter: number;
  private verificationIdCounter: number;
  private settingIdCounter: number;
  private pendingVerificationIdCounter: number;

  constructor() {
    this.keysData = new Map();
    this.verificationsData = new Map();
    this.settingsData = new Map();
    this.pendingVerificationsData = new Map();
    this.keyIdCounter = 1;
    this.verificationIdCounter = 1;
    this.settingIdCounter = 1;
    this.pendingVerificationIdCounter = 1;
  }

  // Keys
  async getAllKeys(): Promise<Key[]> {
    return Array.from(this.keysData.values());
  }

  async getKey(id: number): Promise<Key | undefined> {
    return this.keysData.get(id);
  }

  async getKeyByNumber(keyNumber: string): Promise<Key | undefined> {
    return Array.from(this.keysData.values()).find(key => key.keyNumber === keyNumber);
  }

  async createKey(keyData: InsertKey): Promise<Key> {
    const id = this.keyIdCounter++;
    const now = new Date();
    const key: Key = { ...keyData, id, lastVerified: null };
    this.keysData.set(id, key);
    return key;
  }

  async updateKey(id: number, keyData: Partial<Key>): Promise<Key | undefined> {
    const existingKey = this.keysData.get(id);
    if (!existingKey) return undefined;
    
    const updatedKey = { ...existingKey, ...keyData };
    this.keysData.set(id, updatedKey);
    return updatedKey;
  }

  async deleteKey(id: number): Promise<boolean> {
    return this.keysData.delete(id);
  }

  // Verifications
  async getVerifications(keyId?: number): Promise<Verification[]> {
    const verifications = Array.from(this.verificationsData.values());
    if (keyId) {
      return verifications.filter(v => v.keyId === keyId);
    }
    return verifications;
  }

  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const id = this.verificationIdCounter++;
    const now = new Date();
    const verification: Verification = { 
      ...verificationData, 
      id, 
      verifiedAt: now 
    };
    this.verificationsData.set(id, verification);
    
    // Update the key's last verified timestamp
    const key = await this.getKey(verificationData.keyId);
    if (key) {
      await this.updateKey(key.id, { 
        lastVerified: now,
        status: verificationData.status
      });
    }
    
    return verification;
  }

  // Settings
  async getSettings(deviceId: string): Promise<Setting | undefined> {
    return Array.from(this.settingsData.values()).find(s => s.deviceId === deviceId);
  }

  async createSettings(settingData: InsertSetting): Promise<Setting> {
    const id = this.settingIdCounter++;
    const setting: Setting = { ...settingData, id };
    this.settingsData.set(id, setting);
    return setting;
  }

  async updateSettings(id: number, settingData: Partial<Setting>): Promise<Setting | undefined> {
    const existingSetting = this.settingsData.get(id);
    if (!existingSetting) return undefined;
    
    const updatedSetting = { ...existingSetting, ...settingData };
    this.settingsData.set(id, updatedSetting);
    return updatedSetting;
  }

  // Pending Verifications
  async getPendingVerifications(): Promise<PendingVerification[]> {
    return Array.from(this.pendingVerificationsData.values());
  }

  async getActivePendingVerification(): Promise<PendingVerification | undefined> {
    const pendingVerifications = Array.from(this.pendingVerificationsData.values());
    return pendingVerifications.find(pv => !pv.isCompleted);
  }

  async createPendingVerification(verificationData: InsertPendingVerification): Promise<PendingVerification> {
    const id = this.pendingVerificationIdCounter++;
    const now = new Date();
    const pendingVerification: PendingVerification = { 
      ...verificationData, 
      id, 
      requestedAt: now,
      completedAt: null,
      isCompleted: false
    };
    this.pendingVerificationsData.set(id, pendingVerification);
    return pendingVerification;
  }

  async completePendingVerification(id: number): Promise<PendingVerification | undefined> {
    const pendingVerification = this.pendingVerificationsData.get(id);
    if (!pendingVerification) return undefined;
    
    const now = new Date();
    const updated: PendingVerification = {
      ...pendingVerification,
      completedAt: now,
      isCompleted: true
    };
    this.pendingVerificationsData.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
