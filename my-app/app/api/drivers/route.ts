import { NextResponse } from 'next/server';

import getAllDrivers from '@/lib/db/queries/getAllDrivers';

// GET /api/drivers - Retrieve all drivers
export async function GET() {
    try {
        const drivers = await getAllDrivers();

        return NextResponse.json({ "data": drivers }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        );
    }
}