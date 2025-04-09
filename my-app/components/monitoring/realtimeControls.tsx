"use client"

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import { AlertsDisplay } from './alertsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center space-x-4">
                <div className="flex flex-row items-center space-x-2">
                    <div className="flex items-center space-x-2">
                        <span>Speed:</span>
                        <Select value={String(pollingInterval)} onValueChange={(value) => setPollingInterval(Number(value))}>
                            <SelectTrigger className="w-[250px]">
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
                        className="w-[250px]"
                        onClick={togglePlayback}
                    >
                        {isPlaying && hasMoreData ? 'Pause' : 'Play'}
                        <div className={isPlaying && hasMoreData ? "block" : "hidden"}>
                            <Loader />
                        </div>
                    </Button>
                </div>
            </div>

            <Separator />


            {
                displayData.length > 0 ? (
                    <div className="grid grid-cols-10 gap-4">
                        <div className="col-span-10">
                            <Card>
                                <CardHeader className="flex flex-row justify-between py-3">
                                    <h3 className="font-medium text-lg">Current Data Point</h3>
                                    <p className="text-sm text-gray-500">{currentRecord?.record_time ? new Date(currentRecord?.record_time).toLocaleString('en-US', {
                                        dateStyle: 'short',
                                        timeStyle: 'medium'
                                    }) : '-'}</p>
                                </CardHeader>
                                <CardContent className="pt-0 pb-3">
                                    {/* Top row - Basic info */}
                                    <div className="grid grid-cols-4 mb-2">
                                        <div>
                                            <span className="text-gray-500 text-sm">Speed:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.speed} km/h</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm">Lat:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.latitude}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm">Long:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.longitude}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm">Direction:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.direction ?? "N/A"}°</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm">Car:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.car_plate_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm">Location:</span>
                                            <span className="font-medium ml-1 text-sm">{currentRecord?.site_name || "Unknown"}</span>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="h-px bg-gray-100 my-2"></div>

                                    {/* Alert States - Compact Grid Layout */}
                                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm">
                                        {currentRecord?.is_rapidly_speedup !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_rapidly_speedup ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Rapidly Accelerating:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_rapidly_speedup ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_rapidly_slowdown !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_rapidly_slowdown ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Rapidly Decelerating:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_rapidly_slowdown ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_neutral_slide !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_neutral_slide ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">N-Slide:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_neutral_slide ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.neutral_slide_time !== null && currentRecord?.neutral_slide_time !== undefined && currentRecord?.neutral_slide_time > 0 && (
                                            <div className="flex items-center">
                                                <span className="text-gray-500">N-Time:</span>
                                                <span className="font-medium ml-1">{currentRecord?.neutral_slide_time}s</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_overspeed !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_overspeed ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Over Speeding:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_overspeed ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.overspeed_time !== null && currentRecord?.overspeed_time !== undefined && currentRecord.overspeed_time > 0 && (
                                            <div className="flex items-center">
                                                <span className="text-gray-500">Overspeed Time:</span>
                                                <span className="font-medium ml-1">{currentRecord.overspeed_time}s</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_fatigue_driving !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_fatigue_driving ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Fatigue:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_fatigue_driving ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_throttle_stop !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_throttle_stop ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Throttle:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_throttle_stop ? 'Stop' : 'OK'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_oil_leak !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_oil_leak ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">Oil:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_oil_leak ? 'Leak' : 'OK'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_neutral_slide_finished !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_neutral_slide_finished ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">N-Finish:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_neutral_slide_finished ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}

                                        {currentRecord?.is_overspeed_finished !== null && (
                                            <div className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-1 ${currentRecord?.is_overspeed_finished ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                                <span className="text-gray-500">O-Finish:</span>
                                                <span className="font-medium ml-1">{currentRecord?.is_overspeed_finished ? 'Yes' : 'No'}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-6">
                            <SpeedGraph chartData={displayData} />
                        </div>
                        <div className="col-span-4 flex flex-col gap-4">
                            <div className="grow">
                                <AlertsDisplay alerts={alerts} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <></>
                )
            }
        </div >
    );
}