'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid
} from 'recharts'

interface ChartData {
    course_name: string
    total_enrollments: number
}

interface EnrollmentReportChartProps {
    data: ChartData[]
}

export function EnrollmentReportChart({ data }: EnrollmentReportChartProps) {
    if (data.length === 0) return null

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4D7" />
                    <XAxis
                        dataKey="course_name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B7355', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B7355', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#FFF4E8' }}
                        contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #F0E4D7',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#FF8C42', fontWeight: 600 }}
                    />
                    <Bar
                        dataKey="total_enrollments"
                        fill="#FF8C42"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? '#D94E1F' : '#FF8C42'}
                                fillOpacity={1 - index * 0.1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
