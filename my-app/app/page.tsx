"use client"

import { useQuery } from "@tanstack/react-query";

import DriverDropdown from "@/components/driver/driverDropdown";
import { queryKeys } from "@/lib/queryKeys";

export default function Dashboard() {
  const { isPending, isError, data: drivers, error } = useQuery({
    queryFn: () => fetch(`/api/drivers`).then(res => res.json()),
    queryKey: queryKeys.fetchAllDrivers(),
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <div className="flex flex-row justify-between">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>
      <DriverDropdown drivers={drivers.drivers} />
    </div>
  );
}
