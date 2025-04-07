import { NextResponse } from 'next/server';

import getRecordDates from '@/lib/db/queries/getDatesWithRecordsByDriverId';

// GET /api/drivers/[id]/records/dates - Retrieve all dates that driver has records for
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: driverId } = await params;
        const dates = await getRecordDates(driverId);

        return NextResponse.json({ "data": dates }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}