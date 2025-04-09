import pool from "@/lib/db/connection";
import { DrivingRecord } from "@/lib/types";

export async function getRealtimeRecordsByDriverId(
    driverId: string,
    date: string,
    startIndex: number = 0,
    limit: number = 100
): Promise<DrivingRecord[]> {
    try {
        const datePart = date.split('T')[0];

        const query = `
            SELECT 
                driver_id,
                car_plate_number,
                latitude,
                longitude, 
                speed,
                direction,
                site_name,
                to_char(record_time, 'YYYY-MM-DD HH24:MI:SS') as record_time,
                is_rapidly_speedup,
                is_rapidly_slowdown,
                is_neutral_slide,
                is_neutral_slide_finished,
                neutral_slide_time,
                is_overspeed,
                is_overspeed_finished,
                overspeed_time,
                is_fatigue_driving,
                is_throttle_stop,
                is_oil_leak
            FROM 
                public.driving_records
            WHERE 
                driver_id = $1
                AND record_time::date = $2::date
            ORDER BY 
                record_time
            LIMIT $3 OFFSET $4
        `;

        const client = await pool.connect();
        const result = await client.query(query, [driverId, datePart, limit, startIndex]);

        client.release();

        return result.rows;
    } catch (error) {
        console.error("Error in getRealtimeRecordsByDriverId:", error);
        throw error;
    }
}