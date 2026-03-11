'use client'

import React, { useState } from 'react'
import { Search, Mail, Phone, Calendar, User, SearchX, CreditCard, BookOpen } from 'lucide-react'
import IdCardToggle from './id-card-toggle'
import BooksDistributionToggle from './books-distribution-toggle'

interface Student {
    id: string
    name: string
    parent_name: string
    email: string
    mobile: string
    enrollment_date: string
    id_card_distributed: boolean
    id_card_distributed_at: string | null
    books_distributed: boolean
    books_distributed_at: string | null
    batch_id: string
}

interface StudentTableProps {
    students: Student[]
    isLoading: boolean
}

export default function StudentTable({ students, isLoading }: StudentTableProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mobile.includes(searchTerm)
    )

    if (isLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="skeleton-row" style={{ marginBottom: '1rem' }} />
                <div className="skeleton-row" style={{ marginBottom: '1rem' }} />
                <div className="skeleton-row" />
                <style jsx>{`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .skeleton-row {
                        height: 48px;
                        background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 8px;
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search by name, email or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Student Name</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Parent Name</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Contact Info</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CreditCard size={14} />
                                    <span>ID Card</span>
                                </div>
                            </th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <BookOpen size={14} />
                                    <span>Books</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row">
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255, 140, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                            <User size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{student.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{student.parent_name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                                            <Mail size={12} color="var(--color-text-muted)" />
                                            <span>{student.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                                            <Phone size={12} color="var(--color-text-muted)" />
                                            <span>{student.mobile}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <IdCardToggle
                                        studentId={student.id}
                                        batchId={student.batch_id}
                                        initialStatus={student.id_card_distributed}
                                        initialTimestamp={student.id_card_distributed_at}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <BooksDistributionToggle
                                        studentId={student.id}
                                        batchId={student.batch_id}
                                        initialStatus={student.books_distributed}
                                        initialTimestamp={student.books_distributed_at}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredStudents.length === 0 && (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <SearchX size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>{searchTerm ? 'No matches found for your search.' : 'No students enrolled in this batch yet.'}</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .table-row:hover {
                    background-color: rgba(255, 140, 66, 0.02);
                }
            `}</style>
        </div>
    )
}
