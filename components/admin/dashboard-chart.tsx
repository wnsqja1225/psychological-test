'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface DashboardChartProps {
    data: any[]
}

export function DashboardChart({ data }: DashboardChartProps) {
    const chartData = useMemo(() => {
        // Group data by date
        const grouped = data.reduce((acc: any, curr: any) => {
            const date = new Date(curr.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})

        // Convert to array and sort by date (simplified)
        return Object.entries(grouped).map(([date, count]) => ({
            name: date,
            total: count
        })).slice(-7) // Last 7 days
    }, [data])

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>최근 7일 테스트 참여 현황</CardTitle>
                <CardDescription>
                    일별 테스트 완료 횟수입니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="currentColor"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
