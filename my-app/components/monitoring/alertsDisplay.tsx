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
            <CardContent className="snap-y snap-proximity overflow-y-auto max-h-[200px] md:max-h-[250px] lg:max-h-[250px] xl:max-h-[300px] 2xl:max-h-[520px]">
                {
                    sortedAlerts.length === 0 ? (
                        <div className="text-center text-gray-500">No alerts</div>
                    ) :
                        sortedAlerts.map((alert, idx) => (
                            <div key={idx} className="snap-center p-2 border-t">
                                <div className="font-medium text-red-600">{alert.type}</div>
                                <div className="text-sm text-gray-600">{alert.time}</div>
                            </div>
                        ))
                }
            </CardContent>
        </Card>
    );
}
