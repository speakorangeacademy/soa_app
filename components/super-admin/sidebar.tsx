'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    CreditCard,
    Receipt,
    QrCode,
    History,
    UserCog,
    Calendar,
    ChevronRight,
    FileBarChart,
    Settings
} from 'lucide-react'

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin/dashboard' },
    { label: 'Courses', icon: BookOpen, href: '/super-admin/courses' },
    { label: 'Batches', icon: Calendar, href: '/super-admin/batches' },
    { label: 'Teachers', icon: Users, href: '/super-admin/teachers' },
    { label: 'Students', icon: GraduationCap, href: '/super-admin/students' },
    { label: 'Payments', icon: CreditCard, href: '/super-admin/payments' },
    { label: 'Receipts', icon: Receipt, href: '/super-admin/receipts' },
    { label: 'Reports', icon: FileBarChart, href: '/super-admin/reports' },
    { label: 'QR Management', icon: QrCode, href: '/super-admin/qr' },
    { label: 'Admin Users', icon: UserCog, href: '/super-admin/admins' },
    { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const pathname = usePathname()

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-surface border-r border-border" style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', height: '100%' }}>
            <div className="p-6 border-b border-border" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>SOA Admin</h2>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <ul style={{ listStyle: 'none' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        backgroundColor: isActive ? 'rgba(255, 140, 66, 0.08)' : 'transparent',
                                        transition: 'var(--transition-fast)',
                                        minHeight: '44px',
                                        fontWeight: isActive ? 600 : 400
                                    }}
                                    className="sidebar-link"
                                >
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span style={{ fontSize: '0.925rem' }}>{item.label}</span>
                                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-border" style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Speak Orange Academy v1.0
                </p>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden-mobile" style={{ width: '260px', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 40 }}>
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            {isOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)', transition: 'opacity 300ms' }}
                    onClick={onClose}
                >
                    <div
                        style={{
                            width: '280px',
                            height: '100%',
                            backgroundColor: 'var(--color-surface)',
                            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </div>
                </div>
            )}

            <style jsx global>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .sidebar-link:hover {
          background-color: rgba(255, 140, 66, 0.04) !important;
          color: var(--color-primary) !important;
          transform: translateX(4px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 10px;
        }
      `}</style>
        </>
    )
}
