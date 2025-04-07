import { NextResponse } from 'next/server';

import getStatistics from '@/lib/db/queries/getStatistics';

// GET /api/drivers/[id]/statistics - Retrieve statistics for a driver to be used in the dashboard
export async function GET(
    request: Request, 
    { params }: { params: { id: string } }
) {
    try {
        if (!params || typeof params.id === 'undefined') {
            return NextResponse.json(
                { error: 'Driver ID is required' },
                { status: 400 }
            );
        }

        const driverId = params.id;
        if (!driverId) {
            return NextResponse.json(
                { error: 'Driver ID is required' },
                { status: 400 }
            );
        }

        const drivers = await getStatistics(driverId);

        return NextResponse.json({ "data": drivers }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        );
    }
}