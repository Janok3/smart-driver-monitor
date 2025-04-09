import { useEffect, useRef } from 'react';
import { toast } from "sonner";

export interface Alert {
    type: string;
    time: string;
}

function formatAlertTime(timestamp: string): string {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
        return timestamp;
    }
}

export function useAlertsNotification(alerts: Alert[]) {
    const lastProcessedAlertIndex = useRef<number>(-1);

    useEffect(() => {
        if (alerts && alerts.length > 0) {
            for (let i = lastProcessedAlertIndex.current + 1; i < alerts.length; i++) {
                toast.warning(`${alerts[i].type}`, {
                    description: `${formatAlertTime(alerts[i].time)}`,
                    position: "top-center"
                });
            }

            if (alerts.length > 0) {
                lastProcessedAlertIndex.current = alerts.length - 1;
            }
        }
    }, [alerts]);

    return { hasAlerts: alerts.length > 0 };
}
