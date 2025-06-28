
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Admin credentials (in production, store these in environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export function setupCustomAuth(app: Express) {
  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          id: "admin",
          username: ADMIN_USERNAME,
          role: "admin"
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set HTTP-only cookie
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          id: "admin",
          username: ADMIN_USERNAME,
          role: "admin"
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Get current admin user
  app.get("/api/admin/me", isAdminAuthenticated, (req: any, res) => {
    res.json(req.admin);
  });
}

// Middleware to check admin authentication
export const isAdminAuthenticated: RequestHandler = (req: any, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid admin token" });
  }
};
