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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const keys = pgTable("keys", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull().default("single-use"),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiMethod: varchar("api_method", { length: 10 }).default("POST"),
  apiHeaders: jsonb("api_headers"),
  requestTemplate: jsonb("request_template"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").notNull(),
  serviceId: integer("service_id").notNull(),
  targetUrl: varchar("target_url", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  response: jsonb("response"),
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

// Schema exports
export const insertKeySchema = createInsertSchema(keys).omit({
  id: true,
  createdAt: true,
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

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertKey = z.infer<typeof insertKeySchema>;
export type Key = typeof keys.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
