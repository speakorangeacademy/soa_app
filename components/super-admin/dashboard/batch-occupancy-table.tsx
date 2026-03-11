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
import { Badge } from '@/components/common/ui'
import { Skeleton } from '@/components/common/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui'

interface BatchStrength {
    id: string
    name: string
    capacity: number
    current_strength: number
}

interface BatchOccupancyTableProps {
    data: BatchStrength[]
    isLoading: boolean
}

export default function BatchOccupancyTable({ data, isLoading }: BatchOccupancyTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Batch Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="animate-fade-up delay-5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    Batch Occupancy
                    <Badge variant="outline" className="ml-auto">
                        {data.length} Batches
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch Name</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Strength</TableHead>
                                <TableHead>Occupancy</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No active batches found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((batch) => {
                                    const occupancy = batch.capacity > 0
                                        ? Math.round((batch.current_strength / batch.capacity) * 100)
                                        : 0;

                                    let statusVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "success";
                                    let statusLabel = "Available";

                                    if (occupancy >= 100) {
                                        statusVariant = "destructive";
                                        statusLabel = "Full";
                                    } else if (occupancy >= 80) {
                                        statusVariant = "warning";
                                        statusLabel = "Filling Fast";
                                    }

                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.name}</TableCell>
                                            <TableCell>{batch.capacity}</TableCell>
                                            <TableCell>{batch.current_strength}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-secondary rounded-full min-w-[60px]">
                                                        <div
                                                            className={`h-full rounded-full ${occupancy >= 100 ? 'bg-[var(--color-danger)]' :
                                                                    occupancy >= 80 ? 'bg-[var(--color-warning)]' :
                                                                        'bg-[var(--color-success)]'
                                                                }`}
                                                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">{occupancy}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
