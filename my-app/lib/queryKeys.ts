export const queryKeys = {
    fetchAllDrivers: () => ['drivers'],
    fetchDriverAnalytics: () => ['drivers', 'analytics'],
    fetchDriverStats: (driverId: string | null) => ['drivers', driverId, 'statistics'],
    fetchDriverRecordsDates: (driverId: string | null) => ['drivers', driverId, 'records', 'dates'],
    fetchRealtimeRecords: (
        driverId: string | null,
        date: string | null,
        startIndex: number = 0,
        limit: number = 100
    ) => ['drivers', driverId, 'records', 'realtime', date, startIndex, limit],
} as const;
