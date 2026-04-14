'use client'

import React, { useState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label } from '@/components/common/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.')
            setIsLoading(false)
            return
        }

        try {
            const result = await resetPassword(formData)
            if (result?.success) {
                setSuccessMessage(result.success)
            } else if (result?.error) {
                setError(result.error)
            }
        } catch (err) {
            setError('Unable to process request. Please try again.')
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
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
            position: 'relative',
            overflow: 'hidden'
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
                    {!successMessage ? (
                        <motion.div
                            key="form"
                            variants={item}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                                <CardHeader style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
                                    <motion.div variants={item}>
                                        <CardTitle style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>Reset Your Password</CardTitle>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            Enter your registered email address to receive a reset link.
                                        </p>
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <motion.div variants={item}>
                                            <Label htmlFor="email">Email Address</Label>
                                            <div style={{ position: 'relative' }}>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    required
                                                    style={{
                                                        paddingLeft: '2.75rem',
                                                        borderColor: error ? 'var(--color-danger)' : undefined
                                                    }}
                                                />
                                                <Mail
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
                                            {error && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    <AlertCircle size={14} />
                                                    {error}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        <motion.div variants={item}>
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                style={{ width: '100%', height: '48px', fontWeight: 600 }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={20} />
                                                        Sending...
                                                    </>
                                                ) : 'Send Reset Link'}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={item} style={{ textAlign: 'center' }}>
                                            <Link
                                                href="/login"
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--color-text-muted)',
                                                    textDecoration: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'color 150ms ease-out'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                            >
                                                <ArrowLeft size={16} />
                                                Back to Login
                                            </Link>
                                        </motion.div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            variants={item}
                            initial="hidden"
                            animate="show"
                        >
                            <Card style={{ textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                                <CardContent style={{ padding: '3rem 2rem' }}>
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
                                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Check Your Email</h2>
                                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                                        {successMessage}
                                    </p>
                                    <Link href="/login">
                                        <Button variant="outline" style={{ width: '100%' }}>
                                            Back to Login
                                        </Button>
                                    </Link>
                                </CardContent>
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
