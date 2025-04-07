import { NextResponse } from 'next/server';

import getStatistics from '@/lib/db/queries/getStatistics';

// GET /api/drivers/[id]/statistics - Retrieve statistics for a driver to be used in the dashboard
export async function GET(
    request: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: driverId } = await params;

        const drivers = await getStatistics(driverId);

        return NextResponse.json({ "data": drivers }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}