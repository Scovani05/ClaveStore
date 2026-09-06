import "dotenv/config";

const useSsl = process.env.DATABASE_URL?.includes("sslmode=require");

export const databaseConfig = {
  url: process.env.DATABASE_URL,
  options: {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? false : false,
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {}
  }
};
