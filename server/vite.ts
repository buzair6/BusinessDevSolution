import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  };

  const vite = await createViteServer({
    server: serverOptions,
    appType: "custom",
    customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
  });

  app.use(vite.middlewares);

  // In development, all unmatched routes (not /api) should fall through to serve the client-side app
  // This ensures client-side routing works. API routes are handled before this middleware.
  app.use("*", async (req, res, next) => {
    // Check if the request is for an API route that might have been unhandled.
    // If so, let the global error handler or specific API error handler manage it.
    if (req.originalUrl.startsWith('/api')) {
        return next(); // Let subsequent middleware (like the API error handler) handle it
    }

    const url = req.originalUrl;
    try {
      // Resolve the client's index.html
      const clientTemplatePath = path.resolve(vite.config.root, "index.html");

      // Read, transform, and serve the HTML
      let template = await fs.promises.readFile(clientTemplatePath, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e); // Pass errors to Express's error handling middleware
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}