export const queryKeys = {
    fetchAllDrivers: () => ['drivers'],
    fetchDriverStats: (driverId: string | null) => ['drivers', driverId, 'statistics'],
} as const;
