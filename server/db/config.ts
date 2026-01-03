import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL || "",
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getPool = () => pool;

export default { query, pool };
