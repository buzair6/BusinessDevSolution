import { Router } from "express";
import passport from "./auth";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";
import { User } from "../shared/schema.js";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

const apiRouter = Router();
const saltRounds = 10;

// --- Authentication Routes ---

apiRouter.post("/register", async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      const userCount = await storage.getUserCount();
      const isAdmin = userCount === 0;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin,
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error registering user" });
    }
});

apiRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Login failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
});

apiRouter.post("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
});

apiRouter.get('/auth/user', isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
});

export default apiRouter;