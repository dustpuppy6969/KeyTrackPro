import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertKeySchema, 
  insertVerificationSchema, 
  insertSettingsSchema,
  insertPendingVerificationSchema
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // -- Keys routes --
  app.get("/api/keys", async (req: Request, res: Response) => {
    try {
      const keys = await storage.getAllKeys();
      res.json(keys);
    } catch (error) {
      res.status(500).json({ message: `Error fetching keys: ${error}` });
    }
  });

  app.get("/api/keys/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const key = await storage.getKey(id);
      
      if (!key) {
        return res.status(404).json({ message: "Key not found" });
      }
      
      res.json(key);
    } catch (error) {
      res.status(500).json({ message: `Error fetching key: ${error}` });
    }
  });

  app.post("/api/keys", async (req: Request, res: Response) => {
    try {
      const keyData = insertKeySchema.parse(req.body);
      const newKey = await storage.createKey(keyData);
      res.status(201).json(newKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid key data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating key: ${error}` });
    }
  });

  app.put("/api/keys/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const keyData = req.body;
      const updatedKey = await storage.updateKey(id, keyData);
      
      if (!updatedKey) {
        return res.status(404).json({ message: "Key not found" });
      }
      
      res.json(updatedKey);
    } catch (error) {
      res.status(500).json({ message: `Error updating key: ${error}` });
    }
  });

  app.delete("/api/keys/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteKey(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Key not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Error deleting key: ${error}` });
    }
  });

  // -- Verification routes --
  app.get("/api/verifications", async (req: Request, res: Response) => {
    try {
      const keyId = req.query.keyId ? parseInt(req.query.keyId as string) : undefined;
      const verifications = await storage.getVerifications(keyId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ message: `Error fetching verifications: ${error}` });
    }
  });

  app.post("/api/verifications", async (req: Request, res: Response) => {
    try {
      const verificationData = insertVerificationSchema.parse(req.body);
      const newVerification = await storage.createVerification(verificationData);
      
      // Check if there's a pending verification for this key
      const pendingVerifications = await storage.getPendingVerifications();
      const pendingForKey = pendingVerifications.find(pv => 
        pv.keyId === verificationData.keyId && !pv.isCompleted
      );
      
      // If there is, mark it as completed
      if (pendingForKey) {
        await storage.completePendingVerification(pendingForKey.id);
      }
      
      res.status(201).json(newVerification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating verification: ${error}` });
    }
  });

  // -- Settings routes --
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const deviceId = req.query.deviceId as string;
      
      if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required" });
      }
      
      let settings = await storage.getSettings(deviceId);
      
      // If no settings for this device, create default settings
      if (!settings) {
        settings = await storage.createSettings({
          randomVerification: true,
          verificationFrequency: 6,
          requirePhotoEvidence: false,
          missingKeyAlerts: true,
          dailySummary: true,
          alertResponseTime: 30,
          autoSync: true,
          syncFrequency: 15,
          deviceId
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: `Error fetching settings: ${error}` });
    }
  });

  app.put("/api/settings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const settingsData = req.body;
      const updatedSettings = await storage.updateSettings(id, settingsData);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: `Error updating settings: ${error}` });
    }
  });

  // -- Pending Verification routes --
  app.get("/api/pending-verifications", async (req: Request, res: Response) => {
    try {
      const pendingVerifications = await storage.getPendingVerifications();
      res.json(pendingVerifications);
    } catch (error) {
      res.status(500).json({ message: `Error fetching pending verifications: ${error}` });
    }
  });

  app.get("/api/pending-verifications/active", async (req: Request, res: Response) => {
    try {
      const activePendingVerification = await storage.getActivePendingVerification();
      
      if (!activePendingVerification) {
        return res.status(404).json({ message: "No active pending verification found" });
      }
      
      // Get the key details
      const key = await storage.getKey(activePendingVerification.keyId);
      
      if (!key) {
        return res.status(404).json({ message: "Key not found for pending verification" });
      }
      
      res.json({ 
        ...activePendingVerification,
        key
      });
    } catch (error) {
      res.status(500).json({ message: `Error fetching active pending verification: ${error}` });
    }
  });

  app.post("/api/pending-verifications", async (req: Request, res: Response) => {
    try {
      const verificationData = insertPendingVerificationSchema.parse(req.body);
      
      // Check if the key exists
      const key = await storage.getKey(verificationData.keyId);
      if (!key) {
        return res.status(404).json({ message: "Key not found" });
      }
      
      // Check if there's already an active pending verification
      const activePendingVerification = await storage.getActivePendingVerification();
      if (activePendingVerification) {
        return res.status(400).json({ 
          message: "There's already an active pending verification",
          pendingVerification: activePendingVerification
        });
      }
      
      const newPendingVerification = await storage.createPendingVerification(verificationData);
      res.status(201).json(newPendingVerification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pending verification data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating pending verification: ${error}` });
    }
  });

  app.put("/api/pending-verifications/:id/complete", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const completedVerification = await storage.completePendingVerification(id);
      
      if (!completedVerification) {
        return res.status(404).json({ message: "Pending verification not found" });
      }
      
      res.json(completedVerification);
    } catch (error) {
      res.status(500).json({ message: `Error completing pending verification: ${error}` });
    }
  });

  // -- Utility routes --
  app.get("/api/generate-device-id", (req: Request, res: Response) => {
    try {
      const deviceId = randomUUID();
      res.json({ deviceId });
    } catch (error) {
      res.status(500).json({ message: `Error generating device ID: ${error}` });
    }
  });

  // -- Create HTTP server --
  const httpServer = createServer(app);
  return httpServer;
}
