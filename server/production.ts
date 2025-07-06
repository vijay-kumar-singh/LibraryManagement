import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";

// Simple logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Set environment variable to indicate mock mode if DATABASE_URL is missing
    if (!process.env.DATABASE_URL) {
      process.env.USE_MOCK_DATA = "true";
      console.log("🔧 No database connection - using mock data for demonstration");
    }
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Serve static files from dist directory in production
    app.use(express.static(path.join(process.cwd(), "dist")));
    
    // Catch-all handler for client-side routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });

    // Use environment port or default to 5000 for local development
    // Render and other cloud platforms will set PORT environment variable
    const port = Number(process.env.PORT) || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });

  } catch (error: any) {
    console.error("❌ Failed to start server:");
    
    if (error.message.includes("DATABASE_URL")) {
      console.error("💡 Database connection required:");
      console.error("   1. Go to your Render service dashboard");
      console.error("   2. Click 'Environment' tab");
      console.error("   3. Add DATABASE_URL with your PostgreSQL connection string");
      console.error("   4. Or create a PostgreSQL database in Render and connect it");
    } else {
      console.error("   Error:", error.message);
    }
    
    process.exit(1);
  }
})();