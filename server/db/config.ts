import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "";
const requireSSL = connectionString.includes("sslmode=require");
const disableSSL = connectionString.includes("sslmode=disable");

const dbConfig: any = {
  connectionString,
};

if (requireSSL) {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
} else if (!disableSSL && connectionString.includes("aws.neon.tech")) {
  // Enable SSL for Neon and other cloud databases by default
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getPool = () => pool;

export default { query, pool };
