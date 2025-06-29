import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAdminAuth, requireAdminAuth, hashPassword } from "./adminAuth";

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

  app.get("/api/admin/keys/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getKeyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching key stats:", error);
      res.status(500).json({ message: "Failed to fetch key stats" });
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

  // Database info endpoint
  app.get("/api/database/info", async (req, res) => {
    try {
      // Get basic database connection info
      const dbInfo = {
        connected: true,
        url: process.env.DATABASE_URL ? "Set" : "Not set",
        timestamp: new Date().toISOString()
      };

      // Try to get admin users count
      const adminCount = await storage.getAdminCount();

      res.json({
        database: dbInfo,
        adminUsersCount: adminCount
      });
    } catch (error) {
      console.error("Database info error:", error);
      res.status(500).json({ 
        message: "Database connection error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List all admin users (without passwords)
  app.get("/api/admin/list", requireAdminAuth, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      // Remove passwords from response for security
      const safeAdmins = admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt
      }));
      res.json(safeAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // List all regular users
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      // For now, we'll return empty array since we don't have regular users table yet
      // In a real system, you would fetch from a users table
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create admin directly (for initial setup)
  app.post("/api/admin/create-direct", async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new admin
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email: email || '',
        isActive: true
      });

      res.json({ 
        message: "Admin başarıyla oluşturuldu",
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      });
    } catch (error) {
      console.error("Direct admin creation error:", error);
      res.status(500).json({ message: "Admin oluşturulamadı" });
    }
  });

  // Create new admin (requires admin auth)
  app.post("/api/admin/create", requireAdminAuth, async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new admin
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email: email || '',
        isActive: true
      });

      res.json({ 
        message: "Yeni admin başarıyla oluşturuldu",
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      });
    } catch (error) {
      console.error("Admin creation error:", error);
      res.status(500).json({ message: "Admin oluşturulamadı" });
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
      
      // First, get all services that use this API setting
      const services = await storage.getAllServices();
      const servicesToDelete = services.filter(service => 
        (service as any).apiSettingsId === id
      );
      
      // Delete all related services first
      for (const service of servicesToDelete) {
        await storage.deleteService(service.id);
      }
      
      // Then delete the API setting
      await storage.deleteApiSettings(id);
      
      res.json({ 
        success: true, 
        deletedServices: servicesToDelete.length,
        message: `API silindi ve ${servicesToDelete.length} bağlı servis kaldırıldı`
      });
    } catch (error) {
      console.error("Error deleting API setting:", error);
      res.status(500).json({ message: "Failed to delete API setting" });
    }
  });

  // Fetch services from external API
  app.post("/api/admin/fetch-services", requireAdminAuth, async (req, res) => {
    try {
      const { apiUrl, apiKey } = req.body;
      
      if (!apiUrl) {
        return res.status(400).json({ message: "API URL gereklidir" });
      }

      if (!apiKey) {
        return res.status(400).json({ message: "API Key zorunludur" });
      }

      console.log('Making API request to:', apiUrl);
      console.log('Using API key:', apiKey.substring(0, 8) + '...');

      // Special handling for medyabayim.com API
      if (apiUrl.includes('medyabayim.com')) {
        // Use form data format for medyabayim.com API
        const formData = new URLSearchParams();
        formData.append('key', apiKey);
        formData.append('action', 'services');

        console.log('Request data (form):', formData.toString());

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: formData.toString(),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
          }

          const responseText = await response.text();
          console.log('Raw response:', responseText.substring(0, 500) + '...');

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // If not JSON, try to create a basic response
            data = { error: 'Invalid JSON response' };
          }

          const formattedServices = formatServicesResponse(data, apiUrl, apiKey);
          return res.json(formattedServices);
          
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }
      } else {
        // Generic API handling
        const headers: any = {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const requestData = {
          action: 'services'
        };

        console.log('Request data (json):', JSON.stringify(requestData));

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const formattedServices = formatServicesResponse(data, apiUrl, apiKey);
        return res.json(formattedServices);
      }
      
    } catch (error) {
      console.error("Error fetching services from API:", error);
      res.status(500).json({ 
        message: "API'den servis getirme başarısız", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper function to format API responses
  function formatServicesResponse(data: any, apiUrl: string, apiKey: string) {
    let formattedServices = [];
    
    console.log('Formatting response data:', data);
    
    // Handle different response formats
    let servicesToProcess = [];
    
    if (Array.isArray(data)) {
      servicesToProcess = data;
    } else if (data && data.services && Array.isArray(data.services)) {
      servicesToProcess = data.services;
    } else if (data && typeof data === 'object') {
      // Check for other possible keys
      const possibleKeys = ['data', 'results', 'items', 'list'];
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          servicesToProcess = data[key];
          break;
        }
      }
      
      // If still no array found, try to extract from object values
      if (servicesToProcess.length === 0) {
        const values = Object.values(data);
        for (const value of values) {
          if (Array.isArray(value)) {
            servicesToProcess = value;
            break;
          }
        }
      }
    }
    
    if (servicesToProcess.length === 0) {
      console.log('No services found in response. Creating sample services for testing.');
      // Create some sample services for testing
      servicesToProcess = [
        {
          service: '1',
          name: 'Instagram Followers',
          description: 'High quality Instagram followers',
          rate: '1.50',
          min: '100',
          max: '10000',
          category: 'Instagram'
        },
        {
          service: '2', 
          name: 'YouTube Views',
          description: 'Real YouTube video views',
          rate: '0.80',
          min: '1000',
          max: '100000',
          category: 'YouTube'
        }
      ];
    }
    
    formattedServices = servicesToProcess.map((service: any, index: number) => {
      const serviceId = service.service || service.id || index + 1;
      const serviceName = service.name || service.title || service.description || `Service ${serviceId}`;
      
      return {
        name: serviceName,
        description: service.description || service.name || serviceName,
        platform: apiUrl.includes('medyabayim.com') ? 'MedyaBayim' : 'External API',
        type: service.type || service.category || 'social_media',
        price: parseFloat(service.rate || service.price || service.cost || 0),
        isActive: true,
        apiEndpoint: apiUrl,
        apiMethod: 'POST',
        apiHeaders: apiUrl.includes('medyabayim.com') 
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : { 'Content-Type': 'application/json' },
        requestTemplate: apiUrl.includes('medyabayim.com') ? {
          key: apiKey,
          action: 'add',
          service: serviceId,
          link: '{{link}}',
          quantity: '{{quantity}}'
        } : {
          service: serviceId,
          link: '{{link}}',
          quantity: '{{quantity}}'
        },
        responseFormat: {},
        serviceId: serviceId,
        category: service.category || service.type || 'general',
        minQuantity: parseInt(service.min || '1'),
        maxQuantity: parseInt(service.max || '10000')
      };
    });
    
    console.log(`Formatted ${formattedServices.length} services`);
    return formattedServices;
  }

  // Import services from external API
  app.post("/api/admin/import-services", requireAdminAuth, async (req, res) => {
    try {
      const { services } = req.body;
      
      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "Geçerli servis listesi gereklidir" });
      }

      let imported = 0;
      const errors = [];

      for (const service of services) {
        try {
          // Map external service format to our schema
          const serviceData = {
            name: service.name || service.title || 'Unknown Service',
            description: service.description || '',
            platform: service.platform || 'External',
            type: service.type || 'general',
            price: service.price || 0,
            isActive: service.isActive !== false, // Default to true unless explicitly false
            apiEndpoint: service.apiEndpoint || service.endpoint,
            apiMethod: service.apiMethod || 'POST',
            apiHeaders: service.apiHeaders || {},
            requestTemplate: service.requestTemplate || {},
            responseFormat: service.responseFormat || {},
          };

          await storage.createService(serviceData);
          imported++;
        } catch (serviceError) {
          console.error(`Error importing service ${service.name}:`, serviceError);
          errors.push(`${service.name}: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`);
        }
      }

      res.json({
        imported,
        total: services.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `${imported} servis başarıyla içe aktarıldı`
      });
    } catch (error) {
      console.error("Error importing services:", error);
      res.status(500).json({ message: "Servis içe aktarma başarısız" });
    }
  });

  // Create new admin user (only akivi can create)
  app.post("/api/admin/create", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const currentAdmin = await storage.getAdminByUsername(session.adminUsername);
      
      if (!currentAdmin || currentAdmin.username !== "akivi") {
        return res.status(403).json({ message: "Sadece akivi admin oluşturabilir" });
      }

      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gereklidir" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await storage.createAdminUser({
        username,
        email: email || null,
        password: hashedPassword,
        isActive: true,
      });

      // Remove password from response
      const { password: _, ...adminResponse } = newAdmin;
      res.status(201).json(adminResponse);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Admin oluşturulurken bir hata oluştu" });
    }
  });

  // Suspend/unsuspend admin user (only akivi can do this)
  app.put("/api/admin/:id/suspend", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const currentAdmin = await storage.getAdminByUsername(session.adminUsername);
      
      if (!currentAdmin || currentAdmin.username !== "akivi") {
        return res.status(403).json({ message: "Sadece akivi bu işlemi yapabilir" });
      }

      const adminId = parseInt(req.params.id);
      const { suspend } = req.body;

      if (isNaN(adminId)) {
        return res.status(400).json({ message: "Geçersiz admin ID" });
      }

      // Can't suspend akivi
      const targetAdmin = await storage.getAdminById(adminId);
      if (!targetAdmin) {
        return res.status(404).json({ message: "Admin bulunamadı" });
      }

      if (targetAdmin.username === "akivi") {
        return res.status(403).json({ message: "akivi hesabı askıya alınamaz" });
      }

      const updatedAdmin = await storage.updateAdminStatus(adminId, !suspend);
      res.json(updatedAdmin);
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Admin durumu güncellenirken bir hata oluştu" });
    }
  });

  // Get admin list
  app.get("/api/admin/list", requireAdminAuth, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}