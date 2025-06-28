import {
  users,
  keys,
  services,
  orders,
  logs,
  apiSettings,
  type User,
  type UpsertUser,
  type Key,
  type InsertKey,
  type Service,
  type InsertService,
  type Order,
  type InsertOrder,
  type Log,
  type InsertLog,
  type InsertApiSettings,
  type ApiSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, isNotNull, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Key operations
  getAllKeys(): Promise<Key[]>;
  getKeyByValue(value: string): Promise<Key | undefined>;
  createKey(key: InsertKey): Promise<Key>;
  updateKey(id: number, updates: Partial<Key>): Promise<Key>;
  deleteKey(id: number): Promise<void>;
  markKeyAsUsed(id: number, usedBy: string): Promise<Key>;
  getKeyStats(): Promise<{
    total: number;
    used: number;
    unused: number;
  }>;

  // Service operations
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: Partial<Service>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
  getOrdersByStatus(status: string): Promise<Order[]>;

  // Log operations
  getAllLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  getLogsByType(type: string): Promise<Log[]>;
  getLogsByUserId(userId: string): Promise<Log[]>;

  // API Settings operations
  createApiSettings(data: InsertApiSettings): Promise<ApiSettings>;
  getAllApiSettings(): Promise<ApiSettings[]>;
  getActiveApiSettings(): Promise<ApiSettings[]>;
  updateApiSettings(id: number, updates: Partial<InsertApiSettings>): Promise<ApiSettings>;
  deleteApiSettings(id: number): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalKeys: number;
    usedKeys: number;
    activeServices: number;
    dailyTransactions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Key operations
  async getAllKeys(): Promise<Key[]> {
    return await db.select().from(keys).orderBy(desc(keys.createdAt));
  }

  async getKeyByValue(value: string): Promise<Key | undefined> {
    const [key] = await db.select().from(keys).where(eq(keys.value, value));
    return key;
  }

  async createKey(key: InsertKey): Promise<Key> {
    const [newKey] = await db.insert(keys).values(key).returning();
    return newKey;
  }

  async updateKey(id: number, updates: Partial<Key>): Promise<Key> {
    const [updatedKey] = await db
      .update(keys)
      .set(updates)
      .where(eq(keys.id, id))
      .returning();
    return updatedKey;
  }

  async deleteKey(id: number): Promise<void> {
    await db.delete(keys).where(eq(keys.id, id));
  }

  async markKeyAsUsed(id: number, usedBy: string): Promise<Key> {
    const [updatedKey] = await db
      .update(keys)
      .set({
        isUsed: true,
        usedAt: new Date(),
        usedBy,
      })
      .where(eq(keys.id, id))
      .returning();
    return updatedKey;
  }

  async getKeyStats(): Promise<{
    total: number;
    used: number;
    unused: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(keys);
    const [usedResult] = await db
      .select({ count: count() })
      .from(keys)
      .where(eq(keys.isUsed, true));

    const total = totalResult.count;
    const used = usedResult.count;
    const unused = total - used;

    return { total, used, unused };
  }

  // Service operations
  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(services.name);
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  // Log operations
  async getAllLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.createdAt));
  }

  async createLog(log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async getLogsByType(type: string): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.type, type))
      .orderBy(desc(logs.createdAt));
  }

  async getLogsByUserId(userId: string): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.createdAt));
  }

  // API Settings methods
  async createApiSettings(data: InsertApiSettings): Promise<ApiSettings> {
    const [apiSetting] = await db.insert(apiSettings).values(data).returning();
    return apiSetting;
  }

  async getAllApiSettings(): Promise<ApiSettings[]> {
    return await db.select().from(apiSettings).orderBy(desc(apiSettings.createdAt));
  }

  async getActiveApiSettings(): Promise<ApiSettings[]> {
    return await db.select().from(apiSettings).where(eq(apiSettings.isActive, true));
  }

  async updateApiSettings(id: number, updates: Partial<InsertApiSettings>): Promise<ApiSettings> {
    const [updated] = await db
      .update(apiSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiSettings.id, id))
      .returning();
    return updated;
  }

  async deleteApiSettings(id: number): Promise<void> {
    await db.delete(apiSettings).where(eq(apiSettings.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalKeys: number;
    usedKeys: number;
    activeServices: number;
    dailyTransactions: number;
  }> {
    const [totalKeysResult] = await db.select({ count: count() }).from(keys);
    const [usedKeysResult] = await db
      .select({ count: count() })
      .from(keys)
      .where(eq(keys.isUsed, true));
    const [activeServicesResult] = await db
      .select({ count: count() })
      .from(services)
      .where(eq(services.isActive, true));

    // Get orders from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [dailyTransactionsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.createdAt, today));

    return {
      totalKeys: totalKeysResult.count,
      usedKeys: usedKeysResult.count,
      activeServices: activeServicesResult.count,
      dailyTransactions: dailyTransactionsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();