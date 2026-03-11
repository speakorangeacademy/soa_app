'use client'

import React, { useState, useEffect } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label } from '@/components/common/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Password requirements state
    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    })

    const validatePassword = (pass: string) => {
        setRequirements({
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            lower: /[a-z]/.test(pass),
            number: /\d/.test(pass),
            special: /[@$!%*?&]/.test(pass)
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setIsLoading(false)
            return
        }

        // Final check on requirements
        const isStrong = Object.values(requirements).every(Boolean)
        if (!isStrong) {
            setError('Please meet all security requirements.')
            setIsLoading(false)
            return
        }

        try {
            const result = await updatePassword(formData)
            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/login?message=Password updated successfully')
                }, 3000)
            } else if (result.error) {
                setError(result.error)
            }
        } catch (err) {
            setError('Unable to update password. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    }

    const RequirementItem = ({ met, label }: { met: boolean, label: string }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: met ? 'var(--color-success)' : 'var(--color-text-muted)',
            transition: 'color 0.2s ease'
        }}>
            <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: met ? 'var(--color-success)' : 'var(--color-border)'
            }} />
            {label}
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
            position: 'relative'
        }}>
            {/* Background Noise Texture */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                zIndex: 0
            }} />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
            >
                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="reset-form"
                            variants={item}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                                <CardHeader style={{ textAlign: 'center' }}>
                                    <motion.div variants={item}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(255, 140, 66, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1.5rem',
                                            color: 'var(--color-primary)'
                                        }}>
                                            <ShieldCheck size={28} />
                                        </div>
                                        <CardTitle style={{ fontSize: '1.75rem' }}>Create New Password</CardTitle>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            Ensure your new password is secure and unique.
                                        </p>
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <motion.div variants={item}>
                                            <Label htmlFor="password">New Password</Label>
                                            <div style={{ position: 'relative' }}>
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    required
                                                    onChange={(e) => validatePassword(e.target.value)}
                                                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                                                />
                                                <Lock
                                                    size={18}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '1rem',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: 'var(--color-text-muted)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '0.75rem',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--color-text-muted)',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>

                                            {/* Strength Meter Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '0.5rem',
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                backgroundColor: '#FBF8F6',
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                <RequirementItem met={requirements.length} label="8+ Characters" />
                                                <RequirementItem met={requirements.upper} label="Uppercase Letter" />
                                                <RequirementItem met={requirements.lower} label="Lowercase Letter" />
                                                <RequirementItem met={requirements.number} label="Number" />
                                                <RequirementItem met={requirements.special} label="Special Character" />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={item}>
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <div style={{ position: 'relative' }}>
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    required
                                                    style={{ paddingLeft: '2.75rem' }}
                                                />
                                                <ShieldCheck
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
                                        </motion.div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: 'rgba(229, 57, 53, 0.05)',
                                                    border: '1px solid var(--color-danger)',
                                                    borderRadius: '6px',
                                                    color: 'var(--color-danger)',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <AlertCircle size={16} />
                                                {error}
                                            </motion.div>
                                        )}

                                        <motion.div variants={item} style={{ marginTop: '0.5rem' }}>
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                style={{ width: '100%', height: '48px', fontWeight: 600 }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={20} />
                                                        Updating...
                                                    </>
                                                ) : 'Update Password'}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={item} style={{ textAlign: 'center' }}>
                                            <Link
                                                href="/forgot-password"
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--color-text-muted)',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Need a new reset link?
                                            </Link>
                                        </motion.div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reset-success"
                            variants={item}
                        >
                            <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.5rem',
                                        color: 'var(--color-success)'
                                    }}
                                >
                                    <CheckCircle2 size={32} />
                                </motion.div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Success!</h2>
                                <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                    Your password has been updated. You are being redirected to the login page.
                                </p>
                                <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Work+Sans:wght@400&display=swap');
                
                :root {
                    --color-bg: #FFF9F4;
                    --color-surface: #FFFFFF;
                    --color-border: #F0E4D7;
                    --color-text: #2C2416;
                    --color-text-muted: #8B7355;
                    --color-primary: #FF8C42;
                    --color-accent: #D94E1F;
                    --color-success: #4CAF50;
                    --color-warning: #FFC107;
                    --color-danger: #E53935;
                }

                body {
                    font-family: 'Work Sans', sans-serif;
                }

                h1, h2, h3, h4, h5, h6 {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                }

                input:focus {
                    box-shadow: 0 0 0 2px var(--color-primary) !important;
                }
            `}</style>
        </div>
    )
}
