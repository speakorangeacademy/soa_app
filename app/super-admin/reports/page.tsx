import React from 'react'
import Shell from '@/components/super-admin/shell'
import { ReportsFilterCard } from '@/components/super-admin/reports-filter-card'
import { FileBarChart } from 'lucide-react'

export const metadata = {
    title: 'Reports | SOA Admin',
    description: 'Institution-wide reporting and analytics.',
}

export default function ReportsPage() {
    return (
        <Shell>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 140, 66, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '12px'
                    }}>
                        <FileBarChart size={32} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                            Institution Reports
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                            Download consolidated data for various metrics within a custom date range.
                        </p>
                    </div>
                </div>

                {/* Filter and Download Card */}
                <div className="grid grid-cols-1 gap-8">
                    <ReportsFilterCard />
                </div>

                {/* Info Section */}
                <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 140, 66, 0.03)',
                    borderRadius: '12px',
                    border: '1px dashed var(--color-border)',
                    maxWidth: '800px',
                    margin: '3rem auto 0'
                }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Reporting Guidelines</h4>
                    <ul style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', listStyle: 'disc', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                        <li>Date ranges are limited to one financial year (max 12 months) per report.</li>
                        <li>Revenue reports only include "Verified" payments for accuracy.</li>
                        <li>Admissions reports show student registration details based on the registration date.</li>
                        <li>Batch-wise and Course-wise reports provide current snapshots of enrollment status.</li>
                    </ul>
                </div>
            </div>
        </Shell>
    )
}
