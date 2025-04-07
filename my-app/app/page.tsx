"use client"

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import DriverDropdown from "@/components/driver/driverDropdown";
import { queryKeys } from "@/lib/queryKeys";
import Statistics from "@/components/records/statistics";

export default function Dashboard() {
  const { isPending, isError, data: drivers, error } = useQuery({
    queryFn: () => fetch(`/api/drivers`).then(res => res.json()),
    queryKey: queryKeys.fetchAllDrivers(),
  })

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const handleDriverChange = (driverId: string) => {
    setSelectedDriver(driverId);
  }

  const {
    isPending: isStatsPending,
    // isError: isStatsError,
    data: driverStats,
    // error: statsError
  } = useQuery({
    queryFn: () => fetch(`/api/drivers/${selectedDriver}/statistics`).then(res => res.json()),
    queryKey: queryKeys.fetchDriverStats(selectedDriver),
    enabled: !!selectedDriver,
  });

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <main>
      <section>
        <div className="flex flex-row justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>
          <DriverDropdown drivers={drivers.data} onDriverChange={handleDriverChange} />
        </div>
      </section>
      <section className="h-[50vh]">
        {!selectedDriver ? (
          <div className="h-full w-full flex justify-center items-center">
            <p className="text-foreground/50">Please select a driver to view their records.</p>
          </div>
        ) : (
          <div className="w-full">
            {
              isStatsPending ? (
                <div className="h-full w-full flex justify-center items-center">
                  <p className="text-foreground/50">Loading driver statistics...</p>
                </div>
              ) : (
                <Statistics statistics={driverStats.data} />
              )
            }
          </div>
        )}
      </section>
    </main>
  );
}
