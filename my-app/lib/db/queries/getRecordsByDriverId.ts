import pool from "@/lib/db/connection";

import { DrivingRecord } from "@/lib/types";

export default async function getRecordsByDriverId(driverId: string): Promise<DrivingRecord[]> {
    const client = await pool.connect();
    const query = `
        SELECT * 
        FROM DRIVING_RECORDS 
        WHERE driver_id = $1
        ORDER BY record_time ASC
    `;
    const result = await client.query<DrivingRecord>(query, [driverId]);
    client.release();

    return result.rows;
}
