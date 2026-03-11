'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label } from '@/components/common/ui'
import { Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface StudentSearchProps {
    onSearch: (studentId: string) => Promise<void>
    isLoading: boolean
}

export function StudentSearch({ onSearch, isLoading }: StudentSearchProps) {
    const [id, setId] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const trimmedId = id.trim()
        if (!trimmedId) {
            setError('Please enter a Student ID.')
            return
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(trimmedId)) {
            setError('Invalid Student ID format. Must be a valid UUID.')
            return
        }

        await onSearch(trimmedId)
    }

    return (
        <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CardHeader>
                <CardTitle>Lookup Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Label>Student UUID</Label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Input
                                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    disabled={isLoading}
                                    style={{
                                        paddingLeft: '2.75rem',
                                        border: error ? '1px solid var(--color-danger)' : undefined
                                    }}
                                />
                                <Search
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                style={{ height: '48px', minWidth: '120px' }}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                            </Button>
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
