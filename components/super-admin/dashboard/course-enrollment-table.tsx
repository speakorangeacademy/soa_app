'use client'

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/common/ui"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui'
import { Skeleton } from '@/components/common/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface EnrollmentData {
    id: string
    name: string
    total_students: number
}

interface CourseEnrollmentTableProps {
    data: EnrollmentData[]
    isLoading: boolean
}

export default function CourseEnrollmentTable({ data, isLoading }: CourseEnrollmentTableProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Course Popularity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Sort data descending by total students
    const sortedData = [...data].sort((a, b) => b.total_students - a.total_students);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up delay-6">

            {/* Chart Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {sortedData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-bg)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderColor: 'var(--color-border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="total_students" radius={[0, 4, 4, 0]}>
                                    {sortedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No enrollment data available.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Popularity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead className="text-right">Total Students</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                                        No courses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedData.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell className="text-right font-bold">{course.total_students}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
