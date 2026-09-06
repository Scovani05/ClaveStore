import cors from "cors";
import express from "express";
import routes from "./routes/index.js";

const app = express();

app.disable("x-powered-by");

const defaultCorsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredCorsOrigins = process.env.CLIENT_URL
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedCorsOrigins = configuredCorsOrigins?.length ? configuredCorsOrigins : defaultCorsOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedCorsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origem não autorizada pelo CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

const createRateLimiter = ({ limit, windowMs }) => {
  const buckets = new Map();

  return (request, response, next) => {
    const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const ip = forwarded || request.socket.remoteAddress || "local";
    const now = Date.now();
    const bucket = buckets.get(ip) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(ip, bucket);

    if (bucket.count > limit) {
      response.status(429).json({ message: "Demasiados pedidos. Tenta novamente dentro de alguns minutos." });
      return;
    }

    if (buckets.size > 1000) {
      for (const [key, value] of buckets.entries()) {
        if (value.resetAt <= now) {
          buckets.delete(key);
        }
      }
    }

    next();
  };
};

app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use("/api/auth", createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 }));
app.use("/api", createRateLimiter({ limit: 180, windowMs: 15 * 60 * 1000 }));
app.use(express.json({ limit: "250kb" }));

app.get("/", (request, response) => {
  response.json({
    name: "ClaveStore PT API",
    status: "online",
    stack: ["Express", "Sequelize", "PostgreSQL", "MVC", "Axios"],
    product: "Loja online portuguesa para instrumentos, áudio, estúdio e artigos ligados à música"
  });
});

app.use("/api", routes);

app.use((request, response) => {
  response.status(404).json({
    message: "Rota não encontrada",
    path: request.originalUrl
  });
});

app.use((error, request, response, next) => {
  const status = error.status || 500;

  response.status(status).json({
    message: error.message || "Erro interno do servidor",
    details: process.env.NODE_ENV === "development" ? error.stack : undefined
  });
});

export default app;