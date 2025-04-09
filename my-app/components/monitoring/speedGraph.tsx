"use client"

import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"


import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { DrivingRecord } from "@/lib/types"

const chartConfig = {
    speed: {
        label: "Speed",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function SpeedGraph({ chartData }: { chartData: DrivingRecord[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Driving Speed</CardTitle>
                <CardDescription>Speed - km/h</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="record_time"
                            tickLine={true}
                            axisLine={true}
                            padding={{ left: 20, right: 20 }}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                try {
                                    const date = new Date(value);
                                    return date.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    });
                                } catch {
                                    return value;
                                }
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="speed"
                            type="natural"
                            stroke="var(--chart-3)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--chart-3)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
