'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Label } from '@/components/common/ui'
import { Loader2, Download, AlertCircle } from 'lucide-react'

const reportTypes = [
    { value: 'Admissions', label: 'Admissions', description: 'Student registrations within selected date range.' },
    { value: 'Revenue', label: 'Revenue', description: 'Verified payments within selected date range.' },
    { value: 'Batch-wise', label: 'Batch-wise Strength', description: 'Current batch strength and capacity.' },
    { value: 'Course-wise', label: 'Course-wise Enrollment', description: 'Enrollment grouped by course.' },
]

export function ReportsFilterCard() {
    const [reportType, setReportType] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [format, setFormat] = useState('Excel')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const isDownloadDisabled = !reportType || !startDate || !endDate || !format || isLoading

    const handleDownload = async () => {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const params = new URLSearchParams({
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                file_format: format,
            })

            const response = await fetch(`/api/reports/download?${params.toString()}`)

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Failed to generate report')
            }

            // Get the blob and trigger download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${reportType}_report_${startDate}_to_${endDate}.${format === 'CSV' ? 'csv' : 'xlsx'}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setSuccess(true)
            // Toast logic would go here if available, otherwise just state
            setTimeout(() => setSuccess(false), 3000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const selectedReportDesc = reportTypes.find(t => t.value === reportType)?.description

    return (
        <Card className="w-full max-w-2xl mx-auto stagger-in">
            <CardHeader>
                <CardTitle>Reports Generator</CardTitle>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Generate and download institution-wide reports.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Report Type */}
                    <div>
                        <Label htmlFor="report_type">Report Type</Label>
                        <Select
                            id="report_type"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="" disabled>Select report type</option>
                            {reportTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </Select>
                        {selectedReportDesc && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                {selectedReportDesc}
                            </p>
                        )}
                    </div>

                    {/* Date Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                        </div>
                    </div>

                    {/* File Format */}
                    <div>
                        <Label htmlFor="file_format">File Format</Label>
                        <Select
                            id="file_format"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                        >
                            <option value="Excel">Excel (.xlsx)</option>
                            <option value="CSV">CSV (.csv)</option>
                        </Select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-danger)',
                            fontSize: '0.875rem',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(229, 57, 53, 0.05)',
                            borderRadius: '4px',
                            border: '1px solid var(--color-danger)'
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div style={{
                            color: 'var(--color-success)',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            fontWeight: 500
                        }}>
                            Report downloaded successfully!
                        </div>
                    )}

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloadDisabled}
                        className="w-full"
                        size="lg"
                        style={{ position: 'relative' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating report...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Download Report
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
            <style jsx>{`
                .stagger-in {
                    animation: fadeUp 0.6s ease-out forwards;
                }
                @keyframes fadeUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .space-y-6 > * + * {
                    margin-top: 1.5rem;
                }
            `}</style>
        </Card>
    )
}
