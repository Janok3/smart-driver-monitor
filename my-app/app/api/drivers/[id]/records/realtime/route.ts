import { NextRequest, NextResponse } from "next/server";
import { getRealtimeRecordsByDriverId } from "@/lib/db/queries/getRealtimeRecordsByDriverId";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: driverId } = await params;
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const startIndex = searchParams.get("startIndex")
        ? parseInt(searchParams.get("startIndex") as string)
        : 0;
    const limit = searchParams.get("limit")
        ? parseInt(searchParams.get("limit") as string)
        : 100;

    if (!date) {
        return NextResponse.json(
            { error: "Date parameter is required" },
            { status: 400 }
        );
    }

    try {
        const records = await getRealtimeRecordsByDriverId(driverId, date, startIndex, limit);
        console.log("Records:", records);
        return NextResponse.json({
            data: records,
            metadata: {
                driverId,
                date,
                startIndex,
                limit,
                count: records.length
            }
        });
    } catch (error) {
        console.error("Error fetching realtime records:", error);
        return NextResponse.json(
            { error: "Failed to fetch realtime records" },
            { status: 500 }
        );
    }
}