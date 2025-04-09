import pool from "@/lib/db/connection";

export default async function getDatesWithRecordsByDriverId(driverId: string): Promise<string[]> {
    const client = await pool.connect();

    const query = `
        SELECT DISTINCT TO_CHAR(record_time, 'YYYY-MM-DD') as date 
        FROM driving_records
        WHERE driver_id = $1
        ORDER BY date ASC
    `;

    const result = await client.query<{ date: string }>(query, [driverId]);
    client.release();

    return result.rows.map(row => row.date);
}
