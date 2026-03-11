'use client'

import React from 'react'
import { login } from '@/app/auth/actions'
import { AlertCircle, LogIn, Mail, Lock, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

// This component uses standard React form handling to ensure maximum compatibility
export default function LoginPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [isPending, setIsPending] = React.useState(false)

    // Using a standard form submission handler is often more reliable when 
    // experiencing "non-responsive" buttons in complex layouts.
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        // Basic check to see if we're even getting here
        console.log("Login form submitted");
        
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        
        try {
            const result = await login(formData);
            
            if (result && result.error) {
                setError(result.error);
                setIsPending(false);
            }
            // If result is null or undefined, a redirect is likely processing
        } catch (e: any) {
            // Next.js redirect "error"
            if (e.message !== 'NEXT_REDIRECT') {
                setError("An unexpected error occurred. Please try again.");
                console.error("Login catch error:", e);
            }
            setIsPending(false);
        }
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
            fontFamily: 'Work Sans, sans-serif'
        }}>
            {/* Animated Background blobs */}
            <div style={{
                position: 'fixed', top: '10%', right: '10%', width: '400px', height: '400px',
                background: 'rgba(255,140,66,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', bottom: '10%', left: '10%', width: '300px', height: '300px',
                background: 'rgba(217,78,31,0.03)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
            }} />

            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: '#ffffff',
                border: '1px solid #F0E4D7',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(44, 36, 22, 0.08)',
                zIndex: 1,
                position: 'relative',
                animation: 'fadeUp 0.6s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'rgba(255, 140, 66, 0.1)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', color: '#FF8C42'
                    }}>
                        <Sparkles size={32} />
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem', fontWeight: 700, color: '#2C2416',
                        fontFamily: 'Outfit, sans-serif', marginBottom: '8px'
                    }}>Welcome Back</h1>
                    <p style={{ color: '#8B7355', fontSize: '0.9375rem' }}>Login to your Academy account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label htmlFor="identifier" style={{
                            display: 'block', marginBottom: '8px', fontSize: '0.875rem',
                            fontWeight: 600, color: '#2C2416'
                        }}>Email or Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                placeholder="name@example.com"
                                required
                                style={{
                                    width: '100%', padding: '12px 16px 12px 44px',
                                    borderRadius: '12px', border: error ? '1.5px solid #E53935' : '1.5px solid #F0E4D7',
                                    outline: 'none', fontSize: '15px', color: '#2C2416',
                                    background: '#fff', transition: 'all 0.2s',
                                    minHeight: '48px'
                                }}
                            />
                            <Mail size={18} style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)', color: '#8B7355'
                            }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="password" style={{
                                fontSize: '0.875rem', fontWeight: 600, color: '#2C2416'
                            }}>Password</label>
                            <Link href="/forgot-password" style={{
                                fontSize: '0.8125rem', color: '#FF8C42', textDecoration: 'none', fontWeight: 500
                            }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                style={{
                                    width: '100%', padding: '12px 16px 12px 44px',
                                    borderRadius: '12px', border: error ? '1.5px solid #E53935' : '1.5px solid #F0E4D7',
                                    outline: 'none', fontSize: '15px', color: '#2C2416',
                                    background: '#fff', transition: 'all 0.2s',
                                    minHeight: '48px'
                                }}
                            />
                            <Lock size={18} style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)', color: '#8B7355'
                            }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px', background: 'rgba(229, 57, 53, 0.05)',
                            border: '1px solid rgba(229, 57, 53, 0.2)', borderRadius: '10px',
                            color: '#E53935', fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        style={{
                            width: '100%', padding: '14px', background: isPending ? '#F0E4D7' : '#FF8C42',
                            color: '#fff', border: 'none', borderRadius: '12px',
                            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '16px',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s', marginTop: '8px',
                            boxShadow: '0 4px 12px rgba(255, 140, 66, 0.2)'
                        }}
                    >
                        {isPending ? <Loader2 size={20} className="spinner" /> : (
                            <>
                                Login <LogIn size={18} />
                            </>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <p style={{ color: '#8B7355', fontSize: '0.875rem' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" style={{ color: '#FF8C42', textDecoration: 'none', fontWeight: 600 }}>
                                Join as Student
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
