import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./models/index.js";

const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    if (process.env.SKIP_DB_SYNC !== "true") {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
    }

    app.listen(port, host, () => {
      console.log(`ClaveStore PT API a correr em http://${host}:${port}`);
    });
  } catch (error) {
    if (process.env.DEMO_FALLBACK !== "false") {
      app.listen(port, host, () => {
        console.log(`ClaveStore PT API com dados locais em http://${host}:${port}`);
      });
      return;
    }

    console.error("Não foi possível iniciar a API", error);
    process.exit(1);
  }
};

start();