import { NextResponse } from 'next/server';
import { getDriverAnalytics } from '@/lib/db/queries/getDriverAnalytics';

// GET /api/drivers/analytics - Retrieve speed analytics for all drivers
export async function GET() {
    try {
        const analytics = await getDriverAnalytics();

        return NextResponse.json({
            data: {
                avgSpeedRanking: analytics.avgSpeedRanking,
                topSpeedRanking: analytics.topSpeedRanking
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching driver analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch driver analytics' },
            { status: 500 }
        );
    }
}