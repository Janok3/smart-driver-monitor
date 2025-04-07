"use client"

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SpeedGraph } from './speedGraph';
import { useRealtimeMonitoring } from '@/lib/hooks/useRealtimeMonitoring';

interface RealtimeControlsProps {
    driverId: string | null;
    date: string | null;
}

export const Loader = () => <LoaderCircle className="w-6 h-6 animate-spin" />;

export default function RealtimeControls({ driverId, date }: RealtimeControlsProps) {
    const [pollingInterval, setPollingInterval] = useState(5000);

    const {
        isLoading,
        isError,
        error,
        displayData,
        currentRecord,
        alerts,
        isPlaying,
        togglePlayback,
        hasMoreData,
    } = useRealtimeMonitoring(driverId, date, {
        pollingInterval,
        batchSize: 100,
    });
    if (isLoading) {
        return <div>Loading data...</div>;
    }

    if (isError) {
        return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
    }

    if (!driverId || !date) {
        return <div>Please select a driver and date</div>;
    }
    console.log("isPlaying", isPlaying);
    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center space-x-4">
                <div className="flex flex-row items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span>Speed:</span>
                        <Select value={String(pollingInterval)} onValueChange={(value) => setPollingInterval(Number(value))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10000">0.5x (10s)</SelectItem>
                                <SelectItem value="5000">1x (5s)</SelectItem>
                                <SelectItem value="2500">2x (2.5s)</SelectItem>
                                <SelectItem value="1000">5x (1s)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={togglePlayback}
                    >
                        {isPlaying && hasMoreData ? 'Pause' : 'Play'}
                        <div className={isPlaying && hasMoreData ? "block" : "hidden"}>
                            <Loader />
                        </div>
                    </Button>
                </div>
            </div>

            {
                displayData.length > 0 ? (
                    <div className="grid grid-cols-10 gap-4  ">
                        <div className="col-span-6">
                            <SpeedGraph chartData={displayData} />
                        </div>
                        <div className="col-span-4 flex flex-col gap-4">
                            <Card>
                                <CardHeader className="flex flex-row justify-between">
                                    <h3 className="font-medium text-lg">Current Data Point</h3>
                                    <p className="text-sm text-gray-500">{currentRecord?.record_time.toString()}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4">
                                        <div>
                                            <span className="text-gray-500">Car:</span>
                                            <span className="font-medium ml-1">{currentRecord?.car_plate_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Speed:</span>
                                            <span className="font-medium ml-1">{currentRecord?.speed} km/h</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Location:</span>
                                            <span className="font-medium ml-1">{currentRecord?.site_name || "Unknown"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-red-50">
                                <CardHeader>
                                    <h3 className="font-medium text-lg">Alerts</h3>
                                </CardHeader>
                                <CardContent className="max-h-70 overflow-y-auto">
                                    {
                                        alerts.length === 0 ? (
                                            <div className="text-center text-gray-500">No alerts</div>
                                        ) :
                                            alerts.map((alert, idx) => (
                                                <div key={idx} className="p-2 border-t">
                                                    <div className="font-medium text-red-600">{alert.type}</div>
                                                    <div className="text-sm text-gray-600">Time: {alert.time}</div>
                                                </div>
                                            ))
                                    }
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )
            }
        </div >
    );
}