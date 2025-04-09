import pool from "@/lib/db/connection";

import { Driver } from "@/lib/types";

export default async function getAllDrivers(): Promise<Driver[]> {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM DRIVERS ORDER BY driver_id ASC');
    client.release();   

    return result.rows;
}