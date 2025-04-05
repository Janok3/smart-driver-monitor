"use client"

import React from 'react';
import { AlertTriangle, Gauge, Clock, TrendingUp, TrendingDown, Coffee, Droplet, Power, GaugeCircle } from 'lucide-react';

import { DriverStatistics } from '@/lib/types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subValue?: string;
    alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subValue, alert }) => {
    return (
        <div className={`bg-white rounded-lg shadow p-4 flex flex-col border-l-4 ${alert && parseInt(value.toString()) > 0 ? 'border-amber-500' : ''}`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className={`${alert && parseInt(value.toString()) > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end">
                <p className="text-2xl font-bold">{value}</p>
                {subValue && <p className="text-sm text-gray-500 ml-2 mb-1">{subValue}</p>}
            </div>
        </div>
    );
};

const Statistics: React.FC<{ statistics: DriverStatistics }> = ({ statistics }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Safety Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Max Speed"
                        value={statistics.max_speed}
                        subValue="km/h"
                        icon={<Gauge size={20} />}
                        alert={statistics.max_speed > 100}
                    />
                    <StatCard
                        title="Overspeed Incidents"
                        value={statistics.total_overspeed_incidents}
                        icon={<AlertTriangle size={20} />}
                        alert={true}
                    />
                    <StatCard
                        title="Overspeed Duration"
                        value={statistics.total_overspeed_duration}
                        subValue="seconds"
                        icon={<Clock size={20} />}
                        alert={parseInt(statistics.total_overspeed_duration.toString()) > 30}
                    />
                    <StatCard
                        title="Neutral Slide Incidents"
                        value={statistics.total_neutral_slide_incidents}
                        icon={<GaugeCircle size={20} />}
                        alert={true}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Driving Behavior</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Rapid Acceleration"
                        value={statistics.total_rapidly_speedup_incidents}
                        icon={<TrendingUp size={20} />}
                        alert={true}
                    />
                    <StatCard
                        title="Harsh Braking"
                        value={statistics.total_rapidly_slowdown_incidents}
                        icon={<TrendingDown size={20} />}
                        alert={true}
                    />
                    <StatCard
                        title="Fatigue Driving"
                        value={statistics.total_fatigue_driving_incidents}
                        icon={<Coffee size={20} />}
                        alert={true}
                    />
                    <StatCard
                        title="Throttle Stop"
                        value={statistics.total_throttle_stop_incidents}
                        icon={<Power size={20} />}
                        alert={true}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Vehicle Issues</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Oil Leak Incidents"
                        value={statistics.total_oil_leak_incidents}
                        icon={<Droplet size={20} />}
                        alert={true}
                    />
                    <StatCard
                        title="Neutral Slide Time"
                        value={statistics.total_neutral_slide_duration}
                        subValue="seconds"
                        icon={<Clock size={20} />}
                        alert={parseInt(statistics.total_neutral_slide_duration.toString()) > 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default Statistics;