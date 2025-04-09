"use client"

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import DateDropdown from "@/components/dates/dateDropdown";
import DriverDropdown from "@/components/driver/driverDropdown";
import RealtimeControls from "@/components/monitoring/realtimeControls";
import { queryKeys } from "@/lib/queryKeys";

export default function RealtimeMonitoring() {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { isPending: isPendingDrivers, isError: isErrorFetchingDrivers, data: drivers, error: errorFetchingDrivers } = useQuery({
        queryFn: () => fetch(`/api/drivers`).then(res => res.json()),
        queryKey: queryKeys.fetchAllDrivers(),
    })

    const { isError: isErrorFetchingRecordDates, data: dates = { data: [] }, error: errorFetchingRecordDates } = useQuery({
        queryFn: () => selectedDriver ? fetch(`/api/drivers/${selectedDriver}/records/dates`).then(res => res.json()) : null,
        queryKey: queryKeys.fetchDriverRecordsDates(selectedDriver),
        enabled: !!selectedDriver,
    })

    const isPending = isPendingDrivers;
    const isError = isErrorFetchingDrivers || isErrorFetchingRecordDates;
    const error = errorFetchingDrivers || errorFetchingRecordDates;

    const handleDriverChange = (driverId: string) => {
        setSelectedDriver(driverId);
        setSelectedDate(null);
    }

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
    }

    if (isPending) {
        return <span>Loading...</span>
    }

    if (isError) {
        return <span>Error: {error instanceof Error ? error.message : "Unknown Error"}</span>
    }

    return (
        <main>
            <section>
                <div className="flex flex-row justify-between mb-4">
                    <h1 className="text-3xl font-bold">
                        Realtime Monitoring (Simulation)
                    </h1>
                    <div className="flex flex-row gap-2">
                        <DriverDropdown drivers={drivers.data} onDriverChange={handleDriverChange} />
                        <DateDropdown
                            dates={dates.data}
                            onDateChange={handleDateChange}
                            selectedDate={selectedDate}
                            selectedDriver={selectedDriver}
                        />
                    </div>
                </div>
            </section>
            <section className="min-h-[50vh]">
                {!selectedDriver ? (
                    <div className="mt-[30vh] h-full w-full flex justify-center items-center">
                        <p className="text-foreground/50">Please select a driver to begin mock monitoring.</p>
                    </div>
                ) : dates.data.length === 0 ? (
                    <div className="mt-[30vh] h-full w-full flex justify-center items-center">
                        <p className="text-foreground/50">No driving records for driver</p>
                    </div>
                ) : !selectedDate ? (
                    <div className="mt-[30vh] h-full w-full flex justify-center items-center">
                        <p className="text-foreground/50">Please select a date to begin mock monitoring.</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <RealtimeControls driverId={selectedDriver} date={selectedDate} />
                    </div>
                )}
            </section>
        </main>
    );
}