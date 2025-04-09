import { NextResponse } from 'next/server';

import getRecordsByDriverId from '@/lib/db/queries/getRecordsByDriverId';

// GET /api/drivers/[id]/records - Retrieve all records for a specific driver
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: driverId } = await params;
        const records = await getRecordsByDriverId(driverId);

        return NextResponse.json({ "data": records }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}