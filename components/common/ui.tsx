'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * ═══════════════════════════════════════════════════════════════════
 * MODAL - Accessible dialog component with design system styling
 * ═══════════════════════════════════════════════════════════════════
 */
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children?: React.ReactNode
    className?: string
    /** Tailwind max-width class — defaults to max-w-2xl */
    maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, className = '', maxWidth = 'max-w-2xl' }: ModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <>
            {/* Dark overlay — covers full viewport including sidebar */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}
                onClick={onClose}
                role="presentation"
                aria-hidden="true"
            />

            {/* Modal scroll container — covers full viewport */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    overflowY: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: '680px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 3rem)',
                        animation: 'modalSlideUp 0.25s ease-out',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                        <h2
                            id="modal-title"
                            style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--color-text)', margin: 0 }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'unset' }}
                            aria-label="Close modal"
                            type="button"
                        >
                            <X size={20} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
                        {children}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>,
        document.body
    )
}


/**
 * ═══════════════════════════════════════════════════════════════════
 * SHEET - Slide-over panel for side navigation
 * ═══════════════════════════════════════════════════════════════════
 */
export function Sheet({ open, onOpenChange, children }: { 
    open: boolean
    onOpenChange: (open: boolean) => void
    children?: React.ReactNode 
}) {
    if (!open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-overlay bg-overlay backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
                aria-hidden="true"
            />
            {children}
        </>
    )
}

export function SheetContent({ children, className = '' }: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <div
            className={`
                fixed inset-y-0 right-0 z-modal w-full max-w-sm 
                bg-surface shadow-xl p-6 flex flex-col 
                animate-slide-in-right overflow-y-auto
                ${className}
            `}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    )
}

export function SheetHeader({ children, className = '' }: { 
    children?: React.ReactNode
    className?: string 
}) {
    return <div className={`mb-6 ${className}`}>{children}</div>
}

export function SheetTitle({ children, className = '' }: { 
    children?: React.ReactNode
    className?: string 
}) {
    return <h2 className={`text-2xl font-heading font-bold text-text ${className}`}>{children}</h2>
}

export function SheetDescription({ children, className = '' }: { 
    children?: React.ReactNode
    className?: string 
}) {
    return <p className={`text-sm text-muted mt-1 ${className}`}>{children}</p>
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * BADGE - Small, semantic indicator component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Badge({ 
    children, 
    variant = 'default',
    className = '' 
}: { 
    children?: React.ReactNode
    variant?: 'success' | 'warning' | 'danger' | 'primary' | 'outline' | 'muted' | 'default'
    className?: string 
}) {
    const variants = {
        success: 'badge badge--success',
        warning: 'badge badge--warning',
        danger: 'badge badge--danger',
        primary: 'badge',
        muted: 'badge badge--muted',
        outline: 'badge badge--outline',
        default: 'badge'
    }

    return (
        <span className={`${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CARD - Container component for grouped content
 * ═══════════════════════════════════════════════════════════════════
 */
export function Card({ 
    children, 
    className = '',
    elevated = false 
}: { 
    children?: React.ReactNode
    className?: string
    elevated?: boolean 
}) {
    return (
        <div className={`card ${elevated ? 'card--elevated' : ''} ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <div className={`pb-4 border-b border-border ${className}`}>
            {children}
        </div>
    )
}

export function CardTitle({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <h3 className={`text-xl font-heading font-bold text-text ${className}`}>
            {children}
        </h3>
    )
}

export function CardDescription({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <p className={`text-sm text-muted mt-2 ${className}`}>
            {children}
        </p>
    )
}

export function CardContent({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <div className={`pt-4 ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <div className={`pt-4 border-t border-border mt-6 flex gap-4 ${className}`}>
            {children}
        </div>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * TABLE - Data display component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Table({
    children,
    className = '',
    containerClassName = ''
}: {
    children?: React.ReactNode
    className?: string
    containerClassName?: string
}) {
    return (
        <div className={`w-full overflow-x-auto rounded-lg border border-border shadow-sm ${containerClassName}`}>
            <table className={`w-full text-sm bg-surface ${className}`}>
                {children}
            </table>
        </div>
    )
}

export function TableHeader({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return <thead className={`border-b border-border bg-bg/50 sticky top-0 z-10 ${className}`}>{children}</thead>
}

export function TableBody({ 
    children 
}: { 
    children?: React.ReactNode 
}) {
    return <tbody>{children}</tbody>
}

export function TableRow({ 
    children, 
    className = '',
    ...props 
}: { 
    children?: React.ReactNode
    className?: string
    [key: string]: any 
}) {
    return (
        <tr className={`border-b border-border hover:bg-bg/30 transition-colors ${className}`} {...props}>
            {children}
        </tr>
    )
}

export function TableHead({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <th className={`px-4 py-3 text-left align-middle font-semibold text-muted text-sm ${className}`}>
            {children}
        </th>
    )
}

export function TableCell({ 
    children, 
    className = '' 
}: { 
    children?: React.ReactNode
    className?: string 
}) {
    return (
        <td className={`px-4 py-3 align-middle text-text ${className}`}>
            {children}
        </td>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * BUTTON - Primary interactive component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    disabled = false, 
    type = 'button',
    loading = false 
}: {
    children?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
}) {
    const variants = {
        primary: 'btn btn--primary',
        secondary: 'btn',
        outline: 'btn',
        danger: 'btn btn--danger',
        success: 'btn btn--success',
        ghost: 'btn'
    }

    const sizes = {
        sm: 'btn--sm',
        md: '',
        lg: 'btn--lg'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${variants[variant]} ${sizes[size]} ${loading ? 'opacity-70' : ''} ${className}`}
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span>
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * FORM INPUTS - Text, textarea, select
 * ═══════════════════════════════════════════════════════════════════
 */
export function Input({ 
    className = '', 
    ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full px-4 py-3 bg-surface border border-border rounded-lg font-body text-base text-text focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all placeholder:text-light ${className}`}
        />
    )
}

export function Textarea({ 
    className = '', 
    rows = 4,
    ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
    return (
        <textarea
            rows={rows}
            {...props}
            className={`w-full px-4 py-3 bg-surface border border-border rounded-lg font-body text-base text-text focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all resize-vertical placeholder:text-light ${className}`}
        />
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SELECT - Dropdown input component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Select({ 
    className = '', 
    children,
    ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`w-full px-4 py-3 appearance-none bg-surface border border-border rounded-lg font-body text-base text-text focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all pr-10 cursor-pointer placeholder:text-light ${className}`}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * LABEL - Form label component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Label({ 
    children, 
    className = '', 
    htmlFor,
    required = false 
}: { 
    children?: React.ReactNode
    className?: string
    htmlFor?: string
    required?: boolean 
}) {
    return (
        <label htmlFor={htmlFor} className={`form-label ${required ? 'form-label--required' : ''} ${className}`}>
            {children}
        </label>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SWITCH - Toggle input component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Switch({ 
    checked, 
    onChange, 
    disabled = false, 
    className = '' 
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex items-center h-6 w-11 rounded-full 
                bg-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring
                ${checked ? 'bg-primary' : 'bg-border'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            <span
                className={`
                    h-5 w-5 bg-white rounded-full shadow-sm 
                    transition-transform duration-200 transform
                    ${checked ? 'translate-x-5' : 'translate-x-1'}
                `}
            />
        </button>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SKELETON - Loading placeholder component
 * ═══════════════════════════════════════════════════════════════════
 */
export function Skeleton({ 
    className = '',
    ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`
                h-12 rounded-lg 
                background-clip-padding
                ${className}
            `}
            style={{
                backgroundColor: 'var(--color-border)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
            {...props}
        />
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CARD SKELETON - Loading state for cards
 * ═══════════════════════════════════════════════════════════════════
 */
export function CardSkeleton({ 
    rows = 3, 
    className = '' 
}: { 
    rows?: number
    className?: string 
}) {
    return (
        <Card className={`overflow-hidden border-none shadow-none bg-surface/50 ${className}`}>
            <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * TABLE SKELETON - Loading state for tables
 * ═══════════════════════════════════════════════════════════════════
 */
export function TableSkeleton({ 
    columns = 4, 
    rows = 5 
}: { 
    columns?: number
    rows?: number 
}) {
    return (
        <div className="w-full overflow-hidden rounded-lg border border-border bg-surface">
            <div className="p-4 border-b border-border bg-bg/30">
                <Skeleton className="h-6 w-1/4" />
            </div>
            <div className="p-4 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        {Array.from({ length: columns }).map((_, j) => (
                            <Skeleton 
                                key={j} 
                                className={`h-4 flex-1 ${j === 0 ? 'w-1/4' : ''}`} 
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- InlineButtonLoader ---
export function InlineButtonLoader({ isLoading, children, className = '', ...props }: { isLoading: boolean, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            disabled={isLoading || props.disabled}
            className={`relative ${className}`}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                    <RefreshCcw className="animate-spin text-bg" size={18} />
                </div>
            )}
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                {children}
            </span>
        </Button>
    )
}

// --- OptimisticStatusBadge ---
export function OptimisticStatusBadge({ status, optimistic = false, variant }: { status: string, optimistic?: boolean, variant?: any }) {
    return (
        <div className="relative inline-block">
            <Badge
                variant={variant || (status === 'Approved' ? 'success' : status === 'Rejected' ? 'destructive' : 'warning')}
                className={`transition-opacity duration-300 ${optimistic ? 'opacity-60' : 'opacity-100'}`}
            >
                {status}
                {optimistic && <span className="ml-1.5 animate-pulse text-[10px]">•</span>}
            </Badge>
        </div>
    )
}

// --- ApiError (inline field-level error message) ---
export function ApiError({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p style={{
            color: 'var(--color-danger)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        }}>
            {message}
        </p>
    )
}

// --- Composable Select (SelectTrigger / SelectValue / SelectContent / SelectItem) ---
// These mimic Radix/ShadCN Select API so existing imports work without changes.

interface SelectContextValue {
    value: string
    open: boolean
    setOpen: (open: boolean) => void
    onSelect: (val: string) => void
}
const SelectCtx = React.createContext<SelectContextValue>({
    value: '', open: false, setOpen: () => {}, onSelect: () => {}
})

export function SelectRoot({
    value,
    onValueChange,
    children,
}: {
    value: string
    onValueChange: (val: string) => void
    children: React.ReactNode
}) {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectCtx.Provider value={{ value, open, setOpen, onSelect: (v) => { onValueChange(v); setOpen(false) } }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                {children}
            </div>
        </SelectCtx.Provider>
    )
}

export function SelectTrigger({ children, style = {} }: { children?: React.ReactNode, style?: React.CSSProperties }) {
    const { open, setOpen } = React.useContext(SelectCtx)
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '8px', padding: '10px 14px',
                background: '#fff', border: '1.5px solid #F0E4D7',
                borderRadius: '10px', cursor: 'pointer', fontSize: '15px',
                color: '#2C2416', minHeight: '44px',
                ...style
            }}
        >
            {children}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
            </svg>
        </button>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const { value } = React.useContext(SelectCtx)
    return <span style={{ color: value ? '#2C2416' : '#8B7355' }}>{value || placeholder}</span>
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
    const { open } = React.useContext(SelectCtx)
    if (!open) return null
    return (
        <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 200,
            minWidth: '100%', background: '#fff',
            border: '1.5px solid #F0E4D7', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(44,36,22,0.10)',
            marginTop: '4px', overflow: 'hidden',
        }}>
            {children}
        </div>
    )
}

export function SelectItem({ value, children }: { value: string, children?: React.ReactNode }) {
    const { onSelect, value: selected } = React.useContext(SelectCtx)
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px', border: 'none', cursor: 'pointer',
                fontSize: '14px', background: selected === value ? 'rgba(255,140,66,0.08)' : 'transparent',
                color: selected === value ? '#FF8C42' : '#2C2416',
                fontWeight: selected === value ? 600 : 400,
                transition: 'background 100ms ease',
            }}
            onMouseEnter={e => { if (selected !== value) (e.currentTarget as HTMLElement).style.background = '#FFF9F4' }}
            onMouseLeave={e => { if (selected !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
            {children}
        </button>
    )
}
