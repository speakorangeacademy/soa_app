'use client'

import React from 'react'
import { logout } from '@/app/auth/actions'
import { Bell, User, LogOut, Menu } from 'lucide-react'

export default function Navbar({ adminName, onMenuClick }: { adminName: string, onMenuClick: () => void }) {
    return (
        <header
            style={{
                height: '72px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 30
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onMenuClick}
                    className="mobile-only"
                    style={{
                        background: 'none',
                        color: 'var(--color-text)',
                        padding: '8px',
                        border: 'none',
                        display: 'none'
                    }}
                >
                    <Menu size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>Super Admin Dashboard</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                    style={{ background: 'none', color: 'var(--color-text-muted)', border: 'none', padding: '8px' }}
                    className="hover-scale"
                >
                    <Bell size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }} className="desktop-only">
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{adminName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Super Admin</p>
                    </div>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 140, 66, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary)'
                        }}
                    >
                        <User size={20} />
                    </div>

                    <form action={logout}>
                        <button
                            type="submit"
                            className="hover-scale"
                            style={{
                                background: 'rgba(229, 57, 53, 0.05)',
                                color: 'var(--color-danger)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '4px',
                                marginLeft: '0.5rem'
                            }}
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </div>

            <style jsx>{`
        .hover-scale {
          transition: var(--transition-fast);
        }
        .hover-scale:hover {
          transform: scale(1.1);
          color: var(--color-primary);
        }
        @media (max-width: 1024px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none; }
        }
      `}</style>
        </header>
    )
}
