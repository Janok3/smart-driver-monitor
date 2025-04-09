import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAlertsNotification, Alert } from '@/lib/hooks/useAlertsNotification';

interface AlertsDisplayProps {
    alerts: Alert[];
}

export function AlertsDisplay({ alerts }: AlertsDisplayProps) {
    useAlertsNotification(alerts);

    const sortedAlerts = [...alerts].reverse();

    return (
        <Card className="bg-red-50 h-full pb-0">
            <CardHeader>
                <h3 className="font-medium text-lg">Alerts</h3>
            </CardHeader>
            <CardContent className="snap-y snap-proximity overflow-y-auto max-h-[480px]">
                {
                    sortedAlerts.length === 0 ? (
                        <div className="text-center text-gray-500">No alerts</div>
                    ) :
                        sortedAlerts.map((alert, idx) => (
                            <div key={idx} className="snap-center p-2 border-t">
                                <div className="font-medium text-red-600">{alert.type}</div>
                                <div className="text-sm text-gray-600">Time: {alert.time}</div>
                            </div>
                        ))
                }
            </CardContent>
        </Card>
    );
}
