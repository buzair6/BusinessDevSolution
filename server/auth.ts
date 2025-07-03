import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
// import connectPg from "connect-pg-simple"; // Temporarily removed for debugging
import bcrypt from "bcryptjs";
import { storage } from "./storage";
// import { pool } from "./db"; // Temporarily removed for debugging
import { User } from "@shared/schema";
import { log } from "./vite";

const saltRounds = 10;

export async function setupAuth(app: Express) {
  // --- Temporarily using default MemoryStore for debugging ---
  // const PgStore = connectPg(session);
  // const sessionStore = new PgStore({
  //   pool: pool,
  //   createTableIfMissing: true,
  //   tableName: "sessions",
  // });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    log("SESSION_SECRET is not set. Please add it to your .env file for security.", "error");
    throw new Error("SESSION_SECRET is not set in the environment. Please add it to your .env file for security.");
  }

  app.use(
    session({
      // store: sessionStore, // Using default MemoryStore
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    }),
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Incorrect email or password." });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect email or password." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Registration route with custom callback
  app.post("/api/register", async (req, res, next) => {
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

  // Login route with custom callback
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Login failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};