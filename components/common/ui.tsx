'use client'

import React from 'react'
import { X, AlertCircle, RefreshCcw, CheckCircle2, Clock, CreditCard, Calendar, User, BookOpen, Hash } from 'lucide-react'

// --- Modal ---
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-lg animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-heading">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-danger tap-target"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

// --- Sheet (Slide-over) ---
export function Sheet({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children?: React.ReactNode }) {
    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-[100] bg-text/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
            onClick={() => onOpenChange(false)}
        >
            {children}
        </div>
    )
}

export function SheetContent({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div
            className={`bg-surface w-full max-w-[85vw] sm:max-w-sm h-full shadow-lg p-6 flex flex-col animate-in slide-in-from-right duration-300 ${className}`}
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    )
}

export function SheetHeader({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return <div className={className} style={{ marginBottom: '1.5rem', ...style }}>{children}</div>
}

export function SheetTitle({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return <h2 className={className} style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', ...style }}>{children}</h2>
}

export function SheetDescription({ children, style = {} }: { children?: React.ReactNode, style?: React.CSSProperties }) {
    return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px', ...style }}>{children}</p>
}

// --- Badge ---
export function Badge({ children, variant = 'info', className = '' }: { children?: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'default' | 'secondary' | 'destructive', className?: string }) {
    const variants = {
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
        destructive: 'bg-danger/10 text-danger',
        info: 'bg-primary/10 text-primary',
        outline: 'bg-transparent text-muted border border-border',
        default: 'bg-primary text-bg',
        secondary: 'bg-border text-text'
    }

    return (
        <span className={`
            inline-flex items-center justify-center 
            px-2.5 py-0.5 rounded-full text-xs font-semibold
            ${variants[variant as keyof typeof variants] || variants.info}
            ${className}
        `}>
            {children}
        </span>
    )
}

// --- Card ---
export function Card({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${className}`} style={style}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`p-6 border-b border-border bg-bg/30 ${className}`} style={style}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <h3 className={`text-xl font-heading leading-tight tracking-tight text-text ${className}`} style={style}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className = '' }: { children?: React.ReactNode, className?: string }) {
    return (
        <p className={`text-sm text-muted mt-1.5 ${className}`}>
            {children}
        </p>
    )
}

export function CardContent({ children, className = '', style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`p-6 ${className}`} style={style}>
            {children}
        </div>
    )
}


// --- Table ---
export function Table({ children, className = '', containerClassName = '' }: { children?: React.ReactNode, className?: string, containerClassName?: string }) {
    return (
        <div className={`w-full overflow-x-auto rounded-lg border border-border shadow-sm ${containerClassName}`}>
            <table className={`w-full caption-bottom text-sm border-collapse bg-surface ${className}`}>
                {children}
            </table>
        </div>
    )
}

export function TableHeader({ children, className = '' }: { children?: React.ReactNode, className?: string }) {
    return <thead className={`border-b border-border bg-bg/50 sticky top-0 z-10 ${className}`}>{children}</thead>
}

export function TableBody({ children }: { children?: React.ReactNode }) {
    return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
}

export function TableRow({ children, className = '', ...props }: { children?: React.ReactNode, className?: string, [key: string]: any }) {
    return (
        <tr className={`border-b border-border transition-colors hover:bg-bg/20 ${className}`} {...props}>
            {children}
        </tr>
    )
}

export function TableHead({ children, className = '' }: { children?: React.ReactNode, className?: string }) {
    return (
        <th className={`h-12 px-4 text-left align-middle font-heading font-semibold text-muted ${className}`}>
            {children}
        </th>
    )
}

export function TableCell({ children, className = '' }: { children?: React.ReactNode, className?: string }) {
    return (
        <td className={`p-4 align-middle text-text ${className}`}>
            {children}
        </td>
    )
}

// --- Button ---
export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', style = {} }: {
    children?: React.ReactNode,
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'destructive',
    size?: 'sm' | 'md' | 'lg',
    className?: string,
    disabled?: boolean,
    type?: 'button' | 'submit' | 'reset',
    style?: React.CSSProperties
}) {
    const variants = {
        primary: 'bg-primary text-bg border-none shadow-sm hover:bg-accent',
        secondary: 'bg-border text-text border-none hover:bg-border/80',
        outline: 'bg-transparent text-text border border-border hover:bg-bg',
        danger: 'bg-danger text-bg border-none hover:opacity-90',
        destructive: 'bg-danger text-bg border-none hover:opacity-90',
        ghost: 'bg-transparent text-text border-none hover:bg-bg'
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-heading'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center gap-2 
                rounded-lg font-semibold tap-target
                transition-all duration-150 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                ${variants[variant]} 
                ${sizes[size]} 
                ${className}
            `}
            style={style}
        >
            {children}
        </button>
    )
}

// --- Input & Textarea ---
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`
                w-full px-4 py-3 bg-surface border border-border rounded-lg 
                focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none 
                transition-all duration-150 tap-target text-text
                placeholder:text-muted/50
                ${className}
            `}
        />
    )
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`
                w-full px-4 py-3 bg-surface border border-border rounded-lg 
                focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none 
                transition-all duration-150 min-h-[120px] text-text
                placeholder:text-muted/50
                ${className}
            `}
        />
    )
}

// --- Select ---
export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`
                    w-full px-4 py-3 bg-surface border border-border rounded-lg 
                    focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none 
                    transition-all duration-150 appearance-none cursor-pointer tap-target text-text
                    ${className}
                `}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}

// --- Label ---
export function Label({ children, className = '', htmlFor, style = {} }: { children?: React.ReactNode, className?: string, htmlFor?: string, style?: React.CSSProperties }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-heading font-semibold text-text mb-2 ${className}`}
            style={style}
        >
            {children}
        </label>
    )
}
// --- Switch ---
export function Switch({ checked, onChange, disabled = false, className = '' }: {
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
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
                transition-colors focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-primary focus-visible:ring-offset-2 
                disabled:cursor-not-allowed disabled:opacity-50
                ${checked ? 'bg-primary' : 'bg-border'}
                ${className}
            `}
        >
            <span
                className={`
                    pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm 
                    ring-0 transition-transform duration-200
                    ${checked ? 'translate-x-5' : 'translate-x-1'}
                `}
            />
        </button>
    )
}

// --- Skeleton ---
export function Skeleton({ className = '', style = {}, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    // Basic heuristics for Tailwind classes in JS
    const inlineStyles: React.CSSProperties = {
        background: 'linear-gradient(90deg, #F0E4D7 25%, #F8F1EA 37%, #F0E4D7 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        borderRadius: '8px',
        ...style
    }
    
    // Fallback dimensions if className contains w-* h-*
    if (className.includes('h-6')) inlineStyles.height = '1.5rem';
    if (className.includes('h-4')) inlineStyles.height = '1rem';
    if (className.includes('w-1/3')) inlineStyles.width = '33.33%';
    if (className.includes('w-1/4')) inlineStyles.width = '25%';
    if (className.includes('w-full')) inlineStyles.width = '100%';

    return (
        <div style={inlineStyles} {...props} />
    )
}

// --- CardSkeleton ---
export function CardSkeleton({ rows = 3, className = '' }: { rows?: number, className?: string }) {
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

// --- TableSkeleton ---
export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number, rows?: number }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-surface">
            <div className="p-4 border-b border-border bg-bg/30">
                <Skeleton className="h-6 w-1/4" />
            </div>
            <div className="p-4 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        {Array.from({ length: columns }).map((_, j) => (
                            <Skeleton key={j} className={`h-4 flex-1 ${j === 0 ? 'w-1/4' : ''}`} />
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
