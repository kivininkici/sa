import bcrypt from 'bcryptjs';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import { adminLoginSchema, type AdminLogin } from '@shared/schema';

// Admin session middleware
export const requireAdminAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: 'Admin girişi gerekli' });
  }
  next();
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Admin auth routes
export function setupAdminAuth(app: Express) {
  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password }: AdminLogin = adminLoginSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      if (!admin.isActive) {
        return res.status(403).json({ message: 'Hesabınız askıya alınmıştır. Lütfen sistem yöneticisiyle iletişime geçin.' });
      }

      const isValidPassword = await comparePassword(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      // Set session
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;

      res.json({ 
        message: 'Giriş başarılı',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(400).json({ message: 'Giriş başarısız' });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Çıkış yapılamadı' });
      }
      res.json({ message: 'Çıkış başarılı' });
    });
  });

  // Check admin session
  app.get('/api/admin/me', requireAdminAuth, async (req, res) => {
    try {
      const admin = await storage.getAdminByUsername(req.session.adminUsername!);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Admin bulunamadı' });
      }

      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Admin bilgileri alınamadı' });
    }
  });

  // Create first admin (only if no admin exists)
  app.post('/api/admin/setup', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if any admin exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin zaten mevcut' });
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email,
        isActive: true
      });

      res.json({ 
        message: 'İlk admin oluşturuldu',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email
        }
      });
    } catch (error) {
      console.error('Admin setup error:', error);
      res.status(500).json({ message: 'Admin oluşturulamadı' });
    }
  });
}

// Type declarations for session
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
    userId?: number;
    username?: string;
    isAdmin?: boolean;
  }
}