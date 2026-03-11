'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, QrCode as QrIcon, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface QrUploadFormProps {
    onSuccess: () => void
    showToast: (type: 'success' | 'error', msg: string) => void
}

export default function QrUploadForm({ onSuccess, showToast }: QrUploadFormProps) {
    const [label, setLabel] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            if (selected.size > 2 * 1024 * 1024) {
                showToast('error', 'File size must be less than 2MB.')
                return
            }
            setFile(selected)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(selected)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!label || !file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('qr_label', label)
        formData.append('file', file)

        try {
            const res = await fetch('/api/payment-qr', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()

            if (res.ok) {
                showToast('success', 'New QR code activated successfully!')
                setLabel('')
                setFile(null)
                setPreview(null)
                onSuccess()
            } else {
                showToast('error', data.error || 'Upload failed')
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} style={{ color: 'var(--color-primary)' }} />
                Upload New Payment QR
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label">QR Label / Display Name</label>
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. Academy GPay QR Feb 2026"
                        required
                        minLength={3}
                    />
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: '2px dashed var(--color-border)',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 140, 66, 0.02)',
                        transition: 'var(--transition-medium)',
                        position: 'relative',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    {preview ? (
                        <div style={{ position: 'relative', width: '100%', maxWidth: '160px' }}>
                            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '4px', boxShadow: 'var(--shadow-sm)' }} />
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: 'var(--color-danger)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    padding: 0,
                                    minHeight: 'unset'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                <ImageIcon size={48} strokeWidth={1} style={{ margin: '0 auto' }} />
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>Click to upload QR Image</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                JPG, PNG or WEBP (Max 2MB)
                            </p>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !file || label.length < 3}
                    style={{ width: '100%', marginTop: '1.5rem' }}
                >
                    {loading ? 'Uploading & Activating...' : (
                        <>
                            <QrIcon size={18} />
                            Upload & Activate New QR
                        </>
                    )}
                </button>
            </form>

            <style jsx>{`
        .label { font-size: 0.875rem; font-weight: 600; display: block; margin-bottom: 0.5rem; }
      `}</style>
        </div>
    )
}
