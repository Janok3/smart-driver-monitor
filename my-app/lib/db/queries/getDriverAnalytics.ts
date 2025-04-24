import pool from "@/lib/db/connection";

import { SpeedAnalytics } from "@/lib/types";

export async function getDriverAnalytics(): Promise<SpeedAnalytics> {
    const client = await pool.connect();

    try {
        const avgSpeedQuery = `
            SELECT driver_id, avg_speed, avg_speed_rank 
            FROM driver_speed_analysis 
            ORDER BY avg_speed_rank ASC`;

        const topSpeedQuery = `
            SELECT driver_id, top_speed, top_speed_rank 
            FROM driver_speed_analysis 
            ORDER BY top_speed_rank ASC`;

        const [avgSpeedResult, topSpeedResult] = await Promise.all([
            client.query(avgSpeedQuery),
            client.query(topSpeedQuery)
        ]);

        return {
            avgSpeedRanking: avgSpeedResult.rows,
            topSpeedRanking: topSpeedResult.rows
        };
    } finally {
        client.release();
    }
}