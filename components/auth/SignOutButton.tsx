'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Modal } from '@/components/ui/modal'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SignOutButtonProps {
    /** Extra Tailwind classes applied to the trigger button */
    className?: string
    /**
     * Visual style of the trigger button.
     * - ghost  → subtle, no background (default — suits navbars)
     * - danger → red tinted (suits settings / profile pages)
     */
    variant?: 'ghost' | 'danger'
    /** Label inside the button. Defaults to "Sign Out". */
    children?: React.ReactNode
}

const variantStyles: Record<NonNullable<SignOutButtonProps['variant']>, string> = {
    ghost: 'text-muted hover:text-text hover:bg-bg',
    danger: 'text-danger hover:bg-danger/10',
}

export function SignOutButton({
    className = '',
    variant = 'ghost',
    children,
}: SignOutButtonProps) {
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleConfirmSignOut() {
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            // Clear the Next.js router cache so stale server-component data
            // from the previous session is not served after sign-out.
            router.refresh()
            router.push('/login')
        } catch (err: any) {
            toast.error('Sign-out failed. Please try again.')
            setLoading(false)
            setModalOpen(false)
        }
    }

    return (
        <>
            {/* ── Trigger ──────────────────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    text-sm font-medium transition-all duration-150
                    ${variantStyles[variant]}
                    ${className}
                `}
            >
                <LogOut size={16} />
                {children ?? 'Sign Out'}
            </button>

            {/* ── Confirmation modal ───────────────────────────────────────── */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { if (!loading) setModalOpen(false) }}
                title="Sign Out"
                description="You'll need to log in again to access your account."
                maxWidth="max-w-sm"
            >
                <div className="flex flex-col gap-3">
                    {/* Confirm */}
                    <button
                        type="button"
                        onClick={handleConfirmSignOut}
                        disabled={loading}
                        className="
                            w-full h-[44px] flex items-center justify-center gap-2
                            bg-danger text-white font-semibold rounded-xl
                            hover:opacity-90 active:scale-[0.98] transition-all
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                        "
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                Yes, Sign Out <LogOut size={15} />
                            </>
                        )}
                    </button>

                    {/* Cancel */}
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        disabled={loading}
                        className="
                            w-full h-[44px] bg-border/50 text-text font-medium rounded-xl
                            hover:bg-border transition-all
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    )
}
