import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAdminAuth, requireAdminAuth } from "./adminAuth";

// Using admin session-based authentication only
import { insertKeySchema, insertServiceSchema, insertOrderSchema, insertApiSettingsSchema } from "@shared/schema";
import { z } from "zod";

// Generate random key
function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Make API request to external service
async function makeServiceRequest(
  endpoint: string,
  method: string,
  headers: any,
  data: any
): Promise<any> {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin auth setup
  setupAdminAuth(app);

  // Admin Dashboard routes
  app.get("/api/admin/dashboard/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin Keys routes
  app.get("/api/admin/keys", requireAdminAuth, async (req, res) => {
    try {
      const keys = await storage.getAllKeys();
      res.json(keys);
    } catch (error) {
      console.error("Error fetching keys:", error);
      res.status(500).json({ message: "Failed to fetch keys" });
    }
  });

  app.post("/api/admin/keys", requireAdminAuth, async (req: any, res) => {
    try {
      const validatedData = insertKeySchema.parse({
        ...req.body,
        value: generateKey(),
        createdBy: req.session.adminUsername || 'admin',
      });

      const key = await storage.createKey(validatedData);

      // Log key creation
      await storage.createLog({
        type: "key_created",
        message: `Key ${key.value} created`,
        userId: req.session.adminUsername || 'admin',
        keyId: key.id,
        data: { keyName: key.name, keyType: key.type },
      });

      res.json(key);
    } catch (error) {
      console.error("Error creating key:", error);
      res.status(500).json({ message: "Failed to create key" });
    }
  });

  app.delete("/api/admin/keys/:id", requireAdminAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKey(id);

      // Log key deletion
      await storage.createLog({
        type: "key_deleted",
        message: `Key with ID ${id} deleted`,
        userId: req.session.adminUsername || 'admin',
        keyId: id,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ message: "Failed to delete key" });
    }
  });

  app.get("/api/admin/keys/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getKeyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching key stats:", error);
      res.status(500).json({ message: "Failed to fetch key stats" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/admin/services/all", requireAdminAuth, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching all services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const service = await storage.updateService(id, updates);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // User interface routes (public)
  app.post("/api/validate-key", async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }

      const foundKey = await storage.getKeyByValue(key);
      if (!foundKey) {
        return res.status(404).json({ message: "Invalid key" });
      }

      if (foundKey.isUsed) {
        return res.status(400).json({ message: "Key has already been used" });
      }

      res.json({ valid: true, keyId: foundKey.id });
    } catch (error) {
      console.error("Error validating key:", error);
      res.status(500).json({ message: "Failed to validate key" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { keyValue, serviceId, targetUrl, quantity } = req.body;

      // Validate key
      const key = await storage.getKeyByValue(keyValue);
      if (!key || key.isUsed) {
        return res.status(400).json({ message: "Invalid or used key" });
      }

      // Get service
      const service = await storage.getServiceById(serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({ message: "Service not available" });
      }

      // Create order
      const order = await storage.createOrder({
        keyId: key.id,
        serviceId,
        targetUrl,
        quantity,
        status: "pending",
      });

      // Mark key as used
      await storage.markKeyAsUsed(key.id, `order_${order.id}`);

      // Log order creation
      await storage.createLog({
        type: "order_created",
        message: `Order created for ${service.name}`,
        keyId: key.id,
        orderId: order.id,
        data: { targetUrl, quantity, service: service.name },
      });

      try {
        // Make API request to external service
        const requestData = {
          ...(service.requestTemplate as any),
          link: targetUrl,
          quantity,
        };

        const response = await makeServiceRequest(
          service.apiEndpoint!,
          service.apiMethod!,
          service.apiHeaders,
          requestData
        );

        // Update order with response
        const updatedOrder = await storage.updateOrder(order.id, {
          status: "completed",
          response,
          completedAt: new Date(),
        });

        // Log success
        await storage.createLog({
          type: "order_completed",
          message: `Order completed successfully`,
          keyId: key.id,
          orderId: order.id,
          data: { response },
        });

        res.json({
          success: true,
          message: "Order completed successfully",
          order: updatedOrder,
        });
      } catch (apiError) {
        // Update order status to failed
        await storage.updateOrder(order.id, {
          status: "failed",
          response: { error: (apiError as Error).message },
        });

        // Log failure
        await storage.createLog({
          type: "order_failed",
          message: `Order failed: ${(apiError as Error).message}`,
          keyId: key.id,
          orderId: order.id,
          data: { error: (apiError as Error).message },
        });

        res.status(500).json({
          success: false,
          message: "Failed to process order",
          error: (apiError as Error).message,
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Admin Orders routes
  app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin Logs routes
  app.get("/api/admin/logs", requireAdminAuth, async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Admin API Management routes
  app.post("/api/admin/fetch-services", requireAdminAuth, async (req, res) => {
    try {
      const { apiUrl, apiKey } = req.body;

      if (!apiUrl) {
        return res.status(400).json({ message: "API URL is required" });
      }

      const headers: any = {
        "Content-Type": "application/json",
      };

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const services = await response.json();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services from API:", error);
      res.status(500).json({ message: "Failed to fetch services from API" });
    }
  });

  app.post("/api/admin/import-services", requireAdminAuth, async (req, res) => {
    try {
      const { services } = req.body;

      if (!services || !Array.isArray(services)) {
        return res.status(400).json({ message: "Services array is required" });
      }

      const importedServices = [];

      for (const service of services) {
        try {
          const validatedData = insertServiceSchema.parse({
            name: service.name,
            platform: service.platform || "External API",
            type: service.type || "API Service",
            icon: service.icon || "Settings",
            isActive: service.isActive !== false,
            apiEndpoint: service.apiEndpoint,
            apiMethod: service.apiMethod || "POST",
            apiHeaders: service.apiHeaders || {},
            requestTemplate: service.requestTemplate || {},
          });

          const createdService = await storage.createService(validatedData);
          importedServices.push(createdService);
        } catch (error) {
          console.error(`Error importing service ${service.name}:`, error);
        }
      }

      res.json({ 
        success: true, 
        imported: importedServices.length,
        services: importedServices 
      });
    } catch (error) {
      console.error("Error importing services:", error);
      res.status(500).json({ message: "Failed to import services" });
    }
  });

  // Admin API Settings routes
  app.get("/api/admin/api-settings", requireAdminAuth, async (req, res) => {
    try {
      const apiSettings = await storage.getAllApiSettings();
      res.json(apiSettings);
    } catch (error) {
      console.error("Error fetching API settings:", error);
      res.status(500).json({ message: "Failed to fetch API settings" });
    }
  });

  app.post("/api/admin/api-settings", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertApiSettingsSchema.parse(req.body);
      const apiSetting = await storage.createApiSettings(validatedData);
      res.json(apiSetting);
    } catch (error) {
      console.error("Error creating API setting:", error);
      res.status(500).json({ message: "Failed to create API setting" });
    }
  });

  app.put("/api/admin/api-settings/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const apiSetting = await storage.updateApiSettings(id, updates);
      res.json(apiSetting);
    } catch (error) {
      console.error("Error updating API setting:", error);
      res.status(500).json({ message: "Failed to update API setting" });
    }
  });

  app.delete("/api/admin/api-settings/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiSettings(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting API setting:", error);
      res.status(500).json({ message: "Failed to delete API setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}