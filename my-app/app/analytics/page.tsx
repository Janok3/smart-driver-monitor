"use client"

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/queryKeys";

interface DriverAnalytics {
  data: {
    avgSpeedRanking: {
      driver_id: string;
      avg_speed: number;
      avg_speed_rank: number;
    }[];
    topSpeedRanking: {
      driver_id: string;
      top_speed: number;
      top_speed_rank: number;
    }[];
  };
}

const columns = {
  rank: "w-1",
  driverId: "w-14",
  speed: "w-48"
};

export default function Analytics() {
  const { isPending, isError, data: analytics, error } = useQuery<DriverAnalytics>({
    queryFn: () => fetch('/api/drivers/analytics').then(res => res.json()),
    queryKey: queryKeys.fetchDriverAnalytics(),
  });

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Driver Analytics</h1>

      <div className="grid grid-cols-2 gap-8">
        <section className="col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Average Speed Rankings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={columns.rank}>Rank</TableHead>
                <TableHead className={columns.driverId}>Driver ID</TableHead>
                <TableHead className={columns.speed}>Average Speed (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.data.avgSpeedRanking.map((driver) => (
                <TableRow key={driver.driver_id}>
                  <TableCell className={columns.rank}>{driver.avg_speed_rank}</TableCell>
                  <TableCell className={columns.driverId}>{driver.driver_id}</TableCell>
                  <TableCell className={columns.speed}>{driver.avg_speed.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Top Speed Rankings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={columns.rank}>Rank</TableHead>
                <TableHead className={columns.driverId}>Driver ID</TableHead>
                <TableHead className={columns.speed}>Top Speed (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.data.topSpeedRanking.map((driver) => (
                <TableRow key={driver.driver_id}>
                  <TableCell className={columns.rank}>{driver.top_speed_rank}</TableCell>
                  <TableCell className={columns.driverId}>{driver.driver_id}</TableCell>
                  <TableCell className={columns.speed}>{driver.top_speed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  );
}
