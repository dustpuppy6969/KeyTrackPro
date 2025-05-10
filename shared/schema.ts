import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Key status enum
export const keyStatusEnum = pgEnum('key_status', ['available', 'verified', 'missing']);

// Keys table
export const keys = pgTable("keys", {
  id: serial("id").primaryKey(),
  keyNumber: text("key_number").notNull().unique(),
  locationName: text("location_name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  description: text("description"),
  status: keyStatusEnum("status").default('available').notNull(),
  lastVerified: timestamp("last_verified"),
  deviceId: text("device_id"),
});

// Verification history
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").notNull().references(() => keys.id),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
  status: keyStatusEnum("status").notNull(),
  deviceId: text("device_id"),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  randomVerification: boolean("random_verification").default(true).notNull(),
  verificationFrequency: integer("verification_frequency").default(6).notNull(), // in hours
  requirePhotoEvidence: boolean("require_photo_evidence").default(false).notNull(),
  missingKeyAlerts: boolean("missing_key_alerts").default(true).notNull(),
  dailySummary: boolean("daily_summary").default(true).notNull(),
  alertResponseTime: integer("alert_response_time").default(30).notNull(), // in minutes
  autoSync: boolean("auto_sync").default(true).notNull(),
  syncFrequency: integer("sync_frequency").default(15).notNull(), // in minutes
  deviceId: text("device_id"),
});

// Pending verifications
export const pendingVerifications = pgTable("pending_verifications", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").notNull().references(() => keys.id),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

// Insert schemas
export const insertKeySchema = createInsertSchema(keys).omit({ id: true, lastVerified: true });
export const insertVerificationSchema = createInsertSchema(verifications).omit({ id: true, verifiedAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertPendingVerificationSchema = createInsertSchema(pendingVerifications).omit({ 
  id: true, 
  requestedAt: true, 
  completedAt: true, 
  isCompleted: true 
});

// Types
export type Key = typeof keys.$inferSelect;
export type InsertKey = z.infer<typeof insertKeySchema>;
export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;
export type PendingVerification = typeof pendingVerifications.$inferSelect;
export type InsertPendingVerification = z.infer<typeof insertPendingVerificationSchema>;
