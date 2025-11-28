import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const isProd = process.env.NODE_ENV === "production";

const connectionString = isProd
  ? process.env.PROD_DATABASE_URL
  : process.env.HML_DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export const pool = new Pool({ connectionString });

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Conectado ao banco:", result.rows[0]);
  } catch (err) {
    console.error("Erro ao conectar:", err);
  }
})();
