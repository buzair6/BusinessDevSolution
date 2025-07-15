import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db.js";
import passport from "./auth";
import apiRouter from "./api";
import { setupVite, serveStatic, log } from "./vite";

async function main() {
  const app = express();
  const server = createServer(app);

  // --- Middleware Setup ---
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Session configuration
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    pool: pool,
    createTableIfMissing: true,
    tableName: "sessions",
  });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    log("SESSION_SECRET is not set. Please add it to your .env file.", "error");
    throw new Error("SESSION_SECRET is not set in the environment.");
  }
  app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  }));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // --- API Routes ---
  app.use("/api", apiRouter);

  // --- Error Handling for API routes specifically ---
  // This middleware will catch any errors from API routes and send a JSON response
  app.use("/api", (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`API Error: ${status} - ${message}`, err.stack);
    res.status(status).json({ message, stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
  });

  // --- Client/Static Asset Serving ---
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server); // setupVite will handle serving the client and HMR
    // The previous app.use("*") in setupVite is removed or modified within setupVite itself
    // to not serve index.html for unmatched API routes.
  } else {
    serveStatic(app);
  }

  // --- Global Error Handler (for non-API routes or unhandled errors) ---
  // This should be the last middleware.
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Global Error: ${status} - ${message}`, err.stack);

    // For non-API requests (e.g., direct client route access), still send HTML
    // Otherwise, send JSON for any unhandled non-API requests if preferred.
    if (req.accepts('json')) {
      res.status(status).json({ message, stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
    } else {
      res.status(status).send(`<h1>${status} - ${message}</h1><pre>${process.env.NODE_ENV === "development" ? err.stack : ''}</pre>`);
    }
  });

  // --- Server Listen ---
  const port = 5000;
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
}

main().catch(err => {
  log(err.stack, "error");
  process.exit(1);
});