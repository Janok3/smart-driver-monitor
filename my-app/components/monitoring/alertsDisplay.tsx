import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAlertsNotification, Alert } from '@/lib/hooks/useAlertsNotification';

interface AlertsDisplayProps {
    alerts: Alert[];
}

export function AlertsDisplay({ alerts }: AlertsDisplayProps) {
    useAlertsNotification(alerts);

    return (
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
    );
}
