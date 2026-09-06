import cors from "cors";
import express from "express";
import routes from "./routes/index.js";

const app = express();

const defaultCorsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredCorsOrigins = process.env.CLIENT_URL
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedCorsOrigins = configuredCorsOrigins?.length ? configuredCorsOrigins : defaultCorsOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem não autorizada pelo CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

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
