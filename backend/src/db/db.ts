import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export function query(text: string, params?: string[]) {
    return pool.query(text, params);
} 