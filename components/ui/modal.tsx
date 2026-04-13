'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Selector for all naturally focusable elements
const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    /** Optional subtitle shown below the title */
    description?: string
    children?: React.ReactNode
    /** Tailwind max-width class — defaults to max-w-md */
    maxWidth?: string
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'max-w-md',
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // ── Save focus before opening; restore it after closing ──────────────────
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement
            // Defer so the panel is in the DOM before we try to focus
            requestAnimationFrame(() => {
                const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
                first?.focus()
            })
        } else {
            previousFocusRef.current?.focus()
        }
    }, [isOpen])

    // ── Focus trap: Tab / Shift+Tab cycles inside the panel; Esc closes ───────
    useEffect(() => {
        if (!isOpen) return

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
                return
            }
            if (e.key !== 'Tab') return

            const focusable = Array.from(
                panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS) ?? []
            )
            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                // Shift+Tab: wrap from first → last
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
            } else {
                // Tab: wrap from last → first
                if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onClose])

    // ── Prevent body scroll while modal is open ───────────────────────────────
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    return (
        // Overlay — clicking the backdrop directly (not the panel) triggers onClose
        <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="soa-modal-title"
            aria-describedby={description ? 'soa-modal-description' : undefined}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-text/40 backdrop-blur-sm animate-in fade-in duration-150"
            onMouseDown={(e) => {
                // Only close when the click lands on the overlay itself, not the panel
                if (e.target === overlayRef.current) onClose()
            }}
        >
            <div
                ref={panelRef}
                className={`relative bg-surface border border-border rounded-2xl w-full ${maxWidth} shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
                // Stop mouse-down from bubbling to the overlay
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
                    <div className="pr-4">
                        <h2
                            id="soa-modal-title"
                            className="text-lg font-bold text-text leading-tight"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            {title}
                        </h2>
                        {description && (
                            <p id="soa-modal-description" className="text-sm text-muted mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-bg transition-colors shrink-0"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    )
}
