import { NextResponse } from 'next/server';

import getRecordsByDriverId from '@/lib/db/queries/getRecordsByDriverId';

// GET /api/records - Retrieve all records for a specific driver
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const driverId = url.searchParams.get('id');
        if (!driverId) {
            return NextResponse.json(
                { error: 'Driver ID is required' },
                { status: 400 }
            );
        }
        const drivers = await getRecordsByDriverId(driverId);

        return NextResponse.json({"drivers": drivers}, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        );
    }
}