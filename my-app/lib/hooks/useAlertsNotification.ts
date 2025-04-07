import { useEffect, useRef } from 'react';
import { toast } from "sonner";

export interface Alert {
    type: string;
    time: string;
}

export function useAlertsNotification(alerts: Alert[]) {
    const lastProcessedAlertIndex = useRef<number>(-1);

    useEffect(() => {
        if (alerts && alerts.length > 0) {
            for (let i = lastProcessedAlertIndex.current + 1; i < alerts.length; i++) {
                toast.warning(`${alerts[i].type}`, {
                    description: `Alert Type: ${alerts[i].type} at ${alerts[i].time}`,
                });
            }

            if (alerts.length > 0) {
                lastProcessedAlertIndex.current = alerts.length - 1;
            }
        }
    }, [alerts]);

    return { hasAlerts: alerts.length > 0 };
}
