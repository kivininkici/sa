import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertKeySchema, insertServiceSchema, insertOrderSchema } from "@shared/schema";
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Keys routes
  app.get("/api/keys", isAuthenticated, async (req, res) => {
    try {
      const keys = await storage.getAllKeys();
      res.json(keys);
    } catch (error) {
      console.error("Error fetching keys:", error);
      res.status(500).json({ message: "Failed to fetch keys" });
    }
  });

  app.post("/api/keys", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertKeySchema.parse({
        ...req.body,
        value: generateKey(),
        createdBy: req.user.claims.sub,
      });

      const key = await storage.createKey(validatedData);
      
      // Log key creation
      await storage.createLog({
        type: "key_created",
        message: `Key ${key.value} created`,
        userId: req.user.claims.sub,
        keyId: key.id,
        data: { keyName: key.name, keyType: key.type },
      });

      res.json(key);
    } catch (error) {
      console.error("Error creating key:", error);
      res.status(500).json({ message: "Failed to create key" });
    }
  });

  app.delete("/api/keys/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKey(id);
      
      // Log key deletion
      await storage.createLog({
        type: "key_deleted",
        message: `Key with ID ${id} deleted`,
        userId: req.user.claims.sub,
        keyId: id,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ message: "Failed to delete key" });
    }
  });

  app.get("/api/keys/stats", isAuthenticated, async (req, res) => {
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

  app.get("/api/services/all", isAuthenticated, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching all services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/services/:id", isAuthenticated, async (req, res) => {
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

  // Orders routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Logs routes
  app.get("/api/logs", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
