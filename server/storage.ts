import {
  users,
  normalUsers,
  keys,
  services,
  orders,
  logs,
  apiSettings,
  adminUsers,
  type User,
  type UpsertUser,
  type NormalUser,
  type InsertNormalUser,
  type Key,
  type InsertKey,
  type Service,
  type InsertService,
  type Order,
  type InsertOrder,
  type Log,
  type InsertLog,
  type InsertApiSettings,
  type ApiSettings,
  type AdminUser,
  type InsertAdminUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull, isNotNull, count } from "drizzle-orm";

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
  updateKeyUsedQuantity(id: number, additionalQuantity: number): Promise<Key>;
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
  bulkCreateServices(serviceList: InsertService[]): Promise<Service[]>;

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

  // Admin operations
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminById(id: number): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: number): Promise<void>;
  updateAdminStatus(id: number, isActive: boolean): Promise<AdminUser>;

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

  async updateKeyUsedQuantity(id: number, additionalQuantity: number): Promise<Key> {
    // First get current key data
    const [currentKey] = await db.select().from(keys).where(eq(keys.id, id));
    if (!currentKey) {
      throw new Error("Key not found");
    }

    const newUsedQuantity = (currentKey.usedQuantity || 0) + additionalQuantity;
    const maxQuantity = currentKey.maxQuantity || 0;
    
    // Check if key should be marked as fully used
    const shouldMarkAsUsed = newUsedQuantity >= maxQuantity;

    const [updatedKey] = await db
      .update(keys)
      .set({
        usedQuantity: newUsedQuantity,
        isUsed: shouldMarkAsUsed,
        usedAt: shouldMarkAsUsed ? new Date() : currentKey.usedAt,
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

  // Bulk operations for better performance with large datasets
  async bulkCreateServices(serviceList: InsertService[]): Promise<Service[]> {
    if (serviceList.length === 0) {
      return [];
    }

    // Process in batches to avoid database limits
    const batchSize = 1000;
    const results: Service[] = [];

    for (let i = 0; i < serviceList.length; i += batchSize) {
      const batch = serviceList.slice(i, i + batchSize);
      try {
        const batchResults = await db.insert(services).values(batch).returning();
        results.push(...batchResults);
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(serviceList.length / batchSize)}`);
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continue with other batches even if one fails
      }
    }

    return results;
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

  // Admin operations
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(admin).returning();
    return newAdmin;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    return admin;
  }

  async updateAdminStatus(id: number, isActive: boolean): Promise<AdminUser> {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set({ isActive })
      .where(eq(adminUsers.id, id))
      .returning();
    return updatedAdmin;
  }

  async getAdminCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(adminUsers);
    return result.count;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }
}

export const storage = new DatabaseStorage();