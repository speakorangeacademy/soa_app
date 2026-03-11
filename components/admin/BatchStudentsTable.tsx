'use client'

import React from 'react'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    Button
} from '@/components/common/ui'
import { ExternalLink, User } from 'lucide-react'

interface Student {
    id: string
    name: string
    parent_name: string
    parent_email: string
    parent_phone: string
    payment_status: 'Approved' | 'Pending' | 'Rejected'
    receipt_url: string | null
    enrollment_date: string
}

interface BatchStudentsTableProps {
    students: Student[]
}

export function BatchStudentsTable({ students }: BatchStudentsTableProps) {
    if (students.length === 0) {
        return (
            <div className="p-12 text-center bg-surface border border-border rounded-xl">
                <p className="text-muted text-lg font-medium">No students enrolled in this batch yet.</p>
            </div>
        )
    }

    return (
        <Table containerClassName="border-none shadow-none bg-transparent">
            <TableHeader className="bg-transparent border-t-0">
                <TableRow className="hover:bg-transparent border-b-2 border-border/50">
                    <TableHead className="font-heading font-bold text-text uppercase tracking-wider text-[10px] sm:text-xs">Student Name</TableHead>
                    <TableHead className="font-heading font-bold text-text uppercase tracking-wider text-[10px] sm:text-xs">Parent Info</TableHead>
                    <TableHead className="font-heading font-bold text-text uppercase tracking-wider text-[10px] sm:text-xs">Payment Status</TableHead>
                    <TableHead className="font-heading font-bold text-text uppercase tracking-wider text-[10px] sm:text-xs text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student, index) => (
                    <TableRow
                        key={student.id}
                        className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both hover:bg-white/50"
                        style={{ animationDelay: `${index * 60}ms` }}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <User size={16} />
                                </div>
                                <span className="font-medium text-text sm:text-base text-sm">{student.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-text">{student.parent_name}</p>
                                <p className="text-xs text-muted leading-none">{student.parent_email || student.parent_phone}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                student.payment_status === 'Approved' ? 'success' :
                                    student.payment_status === 'Rejected' ? 'danger' : 'warning'
                            }>
                                {student.payment_status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                {student.receipt_url ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 gap-2 border-primary/20 hover:border-primary/50 text-primary"
                                        onClick={() => window.open(student.receipt_url!, '_blank')}
                                    >
                                        <ExternalLink size={14} />
                                        <span className="hidden sm:inline">Receipt</span>
                                    </Button>
                                ) : (
                                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-tighter mr-2">No Receipt</span>
                                )}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="h-9 px-3 sm:px-4"
                                    onClick={() => window.location.href = `/admin/students/${student.id}`}
                                >
                                    View
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
