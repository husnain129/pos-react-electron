"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.query = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const dbConfig = {
    connectionString: process.env.DATABASE_URL || "",
    ssl: {
        rejectUnauthorized: false,
    },
};
const pool = new pg_1.Pool(dbConfig);
const query = (text, params) => pool.query(text, params);
exports.query = query;
const getPool = () => pool;
exports.getPool = getPool;
exports.default = { query: exports.query, pool };
