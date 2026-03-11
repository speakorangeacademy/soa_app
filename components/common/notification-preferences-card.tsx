'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Mail, MessageSquare, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Switch, Skeleton } from './ui'

interface NotificationPreferences {
    email_opt_in: boolean
    sms_opt_in: boolean
}

export function NotificationPreferencesCard() {
    const queryClient = useQueryClient()
    const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>({
        email_opt_in: true,
        sms_opt_in: false
    })
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // 1. Fetch Preferences
    const { data: serverPrefs, isLoading: isFetching, error: fetchError } = useQuery<NotificationPreferences>({
        queryKey: ['notification-preferences'],
        queryFn: async () => {
            const res = await fetch('/api/notification-preferences')
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Could not load your preferences.')
            }
            return res.json()
        }
    })

    // Sync local state when server data is loaded
    useEffect(() => {
        if (serverPrefs) {
            setLocalPrefs(serverPrefs)
        }
    }, [serverPrefs])

    // 2. Save Mutation
    const { mutate: savePrefs, isPending: isSaving } = useMutation({
        mutationFn: async (newPrefs: NotificationPreferences) => {
            const res = await fetch('/api/notification-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrefs)
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Unable to save preferences. Please try again.')
            }
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
            setToast({ type: 'success', message: data.message || 'Notification preferences updated successfully.' })
            setTimeout(() => setToast(null), 3000)
        },
        onError: (error: any) => {
            setToast({ type: 'error', message: error.message })
            setTimeout(() => setToast(null), 5000)
        }
    })

    const hasChanges = serverPrefs && (
        localPrefs.email_opt_in !== serverPrefs.email_opt_in ||
        localPrefs.sms_opt_in !== serverPrefs.sms_opt_in
    )

    const handleToggle = (key: keyof NotificationPreferences) => {
        setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (isFetching) {
        return (
            <Card className="animate-fade-up">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
            </Card>
        )
    }

    if (fetchError) {
        return (
            <Card className="border-[var(--color-danger)] bg-red-50/10">
                <CardContent className="p-12 text-center">
                    <AlertCircle className="mx-auto mb-4 text-[var(--color-danger)]" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Failed to load preferences</h3>
                    <p className="text-[var(--color-text-muted)] mb-6">{fetchError.message}</p>
                    <Button onClick={() => queryClient.refetchQueries({ queryKey: ['notification-preferences'] })}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="animate-fade-up relative overflow-visible">
            {/* Toast Notification */}
            {toast && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
                    style={{ animation: 'slideUp 0.3s ease-out' }}
                >
                    <div
                        className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${toast.type === 'success'
                                ? 'bg-[var(--color-success)] text-white border-[var(--color-success)]'
                                : 'bg-[var(--color-danger)] text-white border-[var(--color-danger)]'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}

            <CardHeader className="flex flex-row items-center gap-4">
                <div style={{ padding: '10px', backgroundColor: 'rgba(255, 140, 66, 0.1)', color: 'var(--color-primary)', borderRadius: '12px' }}>
                    <Bell size={24} />
                </div>
                <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you want to be contacted for updates.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Email Option */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--color-text)]">Email Notifications</p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                Receive important updates like payment confirmations, batch changes, and receipts.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={localPrefs.email_opt_in}
                        onChange={() => handleToggle('email_opt_in')}
                        disabled={isSaving}
                    />
                </div>

                {/* SMS Option */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--color-text)]">SMS Notifications</p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                Receive critical alerts via SMS (future feature).
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={localPrefs.sms_opt_in}
                        onChange={() => handleToggle('sms_opt_in')}
                        disabled={isSaving}
                    />
                </div>

                <div className="pt-4">
                    <Button
                        onClick={() => savePrefs(localPrefs)}
                        disabled={!hasChanges || isSaving}
                        className="w-full h-12 flex items-center justify-center gap-2 group"
                        style={{
                            transition: 'all 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving Preferences...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="group-hover:scale-110 transition-transform" />
                                Save Preferences
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </Card>
    )
}
