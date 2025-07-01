import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  numeric,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 50 }).notNull().default("user"), // "user" or "admin"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table for separate admin authentication
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Normal users table for regular user authentication
export const normalUsers = pgTable("normal_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const keys = pgTable("keys", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull().default("single-use"),
  category: varchar("category", { length: 100 }).notNull().default("Instagram"), // Key kategorisi
  serviceId: integer("service_id"),
  apiSettingsId: integer("api_settings_id"), // Hangi API'ye ait olduğunu belirler
  maxQuantity: integer("max_quantity"),
  usedQuantity: integer("used_quantity").notNull().default(0),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by", { length: 255 }),
  validityDays: integer("validity_days").notNull().default(7), // Key geçerlilik süresi (gün)
  expiresAt: timestamp("expires_at"), // Otomatik hesaplanan son kullanma tarihi
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  platform: varchar("platform", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiMethod: varchar("api_method", { length: 10 }).default("POST"),
  apiHeaders: jsonb("api_headers"),
  requestTemplate: jsonb("request_template"),
  responseFormat: jsonb("response_format"),
  serviceId: varchar("service_id", { length: 100 }), // For external API service ID
  apiSettingsId: integer("api_settings_id"), // Hangi API'den geldiğini belirler
  category: varchar("category", { length: 100 }),
  minQuantity: integer("min_quantity").default(1),
  maxQuantity: integer("max_quantity").default(10000),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().unique(), // Random order ID like #32390242
  keyId: integer("key_id").notNull(),
  serviceId: integer("service_id").notNull(),
  targetUrl: varchar("target_url", { length: 500 }),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  response: jsonb("response"),
  message: text("message"), // Status message for user
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  userId: varchar("user_id", { length: 255 }),
  keyId: integer("key_id"),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiSettings = pgTable("api_settings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("api_url", { length: 500 }).notNull(),
  apiKey: varchar("api_key", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0.00"), // API bakiyesi
  lastBalanceCheck: timestamp("last_balance_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bildirim sistemi için notification tablosu
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'order_cancelled', 'order_completed', 'order_failed'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  orderId: varchar("order_id", { length: 50 }), // Sipariş ID'si
  orderData: jsonb("order_data"), // Sipariş detayları
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertKeySchema = createInsertSchema(keys).omit({
  id: true,
  createdAt: true,
}).extend({
  maxQuantity: z.number().min(1, "Miktar en az 1 olmalı"),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export const insertApiSettingsSchema = createInsertSchema(apiSettings).omit({
  id: true,
  balance: true,
  lastBalanceCheck: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertNormalUserSchema = createInsertSchema(normalUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
  isActive: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertNormalUser = z.infer<typeof insertNormalUserSchema>;
export type NormalUser = typeof normalUsers.$inferSelect;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type InsertKey = z.infer<typeof insertKeySchema>;
export type Key = typeof keys.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertApiSettings = z.infer<typeof insertApiSettingsSchema>;
export type ApiSettings = typeof apiSettings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
