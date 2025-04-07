import pool from "@/lib/db/connection";
import { DriverStatistics } from "@/lib/types";

export default async function getDriverStatistics(driverId: string): Promise<DriverStatistics> {
    const client = await pool.connect();
    try {
        const query = `
        SELECT 
            COUNT(CASE WHEN is_neutral_slide = 1 THEN 1 END) AS total_neutral_slide_incidents,
            SUM(neutral_slide_time) AS total_neutral_slide_duration,
            COUNT(CASE WHEN is_overspeed = 1 THEN 1 END) AS total_overspeed_incidents,
            SUM(overspeed_time) AS total_overspeed_duration,
            COUNT(CASE WHEN is_rapidly_speedup = 1 THEN 1 END) AS total_rapidly_speedup_incidents,
            COUNT(CASE WHEN is_rapidly_slowdown = 1 THEN 1 END) AS total_rapidly_slowdown_incidents,
            COUNT(CASE WHEN is_fatigue_driving = 1 THEN 1 END) AS total_fatigue_driving_incidents,
            COUNT(CASE WHEN is_oil_leak = 1 THEN 1 END) AS total_oil_leak_incidents,
            COUNT(CASE WHEN is_throttle_stop = 1 THEN 1 END) AS total_throttle_stop_incidents,
            MAX(speed) AS max_speed
        FROM driving_records
        WHERE driver_id = $1
    `;

        const result = await client.query<DriverStatistics>(query, [driverId]);

        return result.rows[0] || {
            total_neutral_slide_incidents: 0,
            total_neutral_slide_duration: 0,
            total_overspeed_incidents: 0,
            total_overspeed_duration: 0,
            total_rapidly_speedup_incidents: 0,
            total_rapidly_slowdown_incidents: 0,
            total_fatigue_driving_incidents: 0,
            total_oil_leak_incidents: 0,
            total_throttle_stop_incidents: 0,
            max_speed: 0
        };
    } finally {
        client.release();
    }
}