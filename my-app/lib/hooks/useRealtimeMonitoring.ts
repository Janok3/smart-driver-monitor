import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { DrivingRecord, RealtimeMonitoringOptions } from '@/lib/types';

const DEFAULT_OPTIONS: RealtimeMonitoringOptions = {
    pollingInterval: 5000,
    batchSize: 100,
};

export function useRealtimeMonitoring(
    driverId: string | null,
    date: string | null,
    options: Partial<RealtimeMonitoringOptions> = {}
) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { pollingInterval, batchSize } = mergedOptions;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [displayData, setDisplayData] = useState<DrivingRecord[]>([]);
    const [currentRecord, setCurrentRecord] = useState<DrivingRecord | null>(null);
    const [alerts, setAlerts] = useState<{ type: string; time: string }[]>([]);

    const [endOfDataReached, setEndOfDataReached] = useState(false);

    const globalIndexRef = useRef(-1);
    const allRecordsRef = useRef<DrivingRecord[]>([]);
    const processedIndices = useRef(new Set<number>());

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const queryClient = useQueryClient();

    const batchStartIndex = Math.max(0, Math.floor(globalIndexRef.current / batchSize) * batchSize);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.fetchRealtimeRecords(driverId, date, batchStartIndex, batchSize),
        queryFn: () => {
            if (!driverId || !date) return null;
            return fetch(`/api/drivers/${driverId}/records/realtime?date=${date}&startIndex=${batchStartIndex}&limit=${batchSize}`)
                .then(res => res.json());
        },
        enabled: !!driverId && !!date,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (data?.data && Array.isArray(data.data)) {

            if (data.data.length < batchSize) {
                setEndOfDataReached(true);
            }

            const startIdx = batchStartIndex;
            const newRecords = data.data;

            if (startIdx === 0) {
                allRecordsRef.current = newRecords;
            } else {
                const existingLength = allRecordsRef.current.length;

                if (startIdx >= existingLength) {
                    allRecordsRef.current = [...allRecordsRef.current, ...newRecords];
                } else {
                    allRecordsRef.current = [
                        ...allRecordsRef.current.slice(0, startIdx),
                        ...newRecords
                    ];
                }
            }
        }
    }, [data, batchStartIndex, batchSize]);

    const hasMoreData = (currentIndex < allRecordsRef.current.length - 1) ||
        (!endOfDataReached && data?.data?.length === batchSize);

    const resetPlaybackState = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPlaying(false);
    };

    const processRecord = (index: number) => {
        if (processedIndices.current.has(index)) {
            return;
        }

        const record = allRecordsRef.current[index];
        if (record) {
            setCurrentRecord(record);

            setDisplayData(prev => {
                const newData = [...prev, record];
                if (newData.length > 100) return newData.slice(-100);
                return newData;
            });

            const newAlerts: { type: string; time: string }[] = [];
            const timeField = record.record_time?.toString() || '';

            if (record.is_rapidly_speedup === 1) {
                newAlerts.push({ type: 'Rapid Speedup', time: timeField });
            }

            if (record.is_rapidly_slowdown === 1) {
                newAlerts.push({ type: 'Rapid Slowdown', time: timeField });
            }

            if (record.is_overspeed === 1) {
                newAlerts.push({ type: 'Overspeeding', time: timeField });
            }

            if (record.is_fatigue_driving === 1) {
                newAlerts.push({ type: 'Fatigue Driving', time: timeField });
            }

            if (record.is_oil_leak === 1) {
                newAlerts.push({ type: 'Oil Leak', time: timeField });
            }

            if (newAlerts.length > 0) {
                setAlerts(prev => [...prev, ...newAlerts].slice(-10));
            }

            processedIndices.current.add(index);
        }
    };

    const startPlayback = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (globalIndexRef.current >= allRecordsRef.current.length - 1) {
            globalIndexRef.current = -1;
        }

        setIsPlaying(true);
        const nextIndex = globalIndexRef.current > -1 ? globalIndexRef.current : 0;
        globalIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);

        if (allRecordsRef.current[nextIndex]) {
            processRecord(nextIndex);
        }

        const currentDateRef = date;
        const currentDriverRef = driverId;

        intervalRef.current = setInterval(() => {
            if (date !== currentDateRef || driverId !== currentDriverRef) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                return;
            }

            const nextIndex = globalIndexRef.current + 1;

            const currentBatch = Math.floor(globalIndexRef.current / batchSize);
            const nextBatch = Math.floor(nextIndex / batchSize);

            if (nextBatch > currentBatch && !endOfDataReached) {
                const nextBatchStart = nextBatch * batchSize;

                queryClient.prefetchQuery({
                    queryKey: queryKeys.fetchRealtimeRecords(
                        driverId,
                        date,
                        nextBatchStart,
                        batchSize
                    ),
                    queryFn: () => {
                        return fetch(`/api/drivers/${driverId}/records/realtime?date=${date}&startIndex=${nextBatchStart}&limit=${batchSize}`)
                            .then(res => res.json());
                    },
                });
            }

            if (nextIndex >= allRecordsRef.current.length && endOfDataReached) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                setIsPlaying(false);
                return;
            }

            globalIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            processRecord(nextIndex);
        }, pollingInterval);
    };

    const togglePlayback = () => {
        if (isPlaying) {
            resetPlaybackState();
        } else {
            if (allRecordsRef.current.length === 0 && data?.data?.length > 0) {
                allRecordsRef.current = data.data;
            }

            if (allRecordsRef.current.length === 0 && driverId && date) {
                queryClient.refetchQueries({
                    queryKey: queryKeys.fetchRealtimeRecords(driverId, date, 0, batchSize),
                });
                setTimeout(() => {
                    if (allRecordsRef.current.length > 0) {
                        startPlayback();
                    }
                }, 100);
            } else {
                startPlayback();
            }
        }
    };

    useEffect(() => {
        if (isPlaying && intervalRef.current) {
            startPlayback();
        }
    }, [pollingInterval]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setCurrentIndex(-1);
        setDisplayData([]);
        setCurrentRecord(null);
        setAlerts([]);
        setIsPlaying(false);
        setEndOfDataReached(false);
        globalIndexRef.current = -1;
        allRecordsRef.current = [];
        processedIndices.current.clear();
    }, [driverId, date]);

    useEffect(() => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            if (isPlaying && intervalRef.current === null) {
                startPlayback();
            }
        }
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        isLoading,
        isError,
        error,
        displayData,
        currentRecord,
        alerts,
        isPlaying,
        togglePlayback,
        currentIndex: currentIndex + 1,
        totalRecords: allRecordsRef.current.length,
        hasMoreData,
    };
}