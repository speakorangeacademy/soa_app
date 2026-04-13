'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogIn, UserPlus, Home, Info, BookOpen, Phone } from 'lucide-react'

const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/#courses', icon: BookOpen },
    { name: 'About', href: '/#about', icon: Info },
    { name: 'Contact', href: '/#contact', icon: Phone },
]

export default function ResponsiveNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <>
            {/* Main Navbar */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                width: '100%',
                background: 'rgba(255, 249, 244, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid #F0E4D7',
                boxShadow: '0 2px 8px rgba(44, 36, 22, 0.06)',
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: '#FF8C42',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <span style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '18px' }}>S</span>
                        </div>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '20px', color: '#2C2416' }}>SpeakOrange Academy</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                style={{
                                    color: '#8B7355',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: '15px',
                                    transition: 'color 150ms ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#FF8C42')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#8B7355')}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/login" style={{ textDecoration: 'none' }}>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', background: 'transparent',
                                border: 'none', cursor: 'pointer',
                                color: '#8B7355', fontWeight: 500, fontSize: '15px',
                                borderRadius: '8px', minHeight: '44px',
                                transition: 'color 150ms ease',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#FF8C42')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#8B7355')}
                            >
                                <LogIn size={16} />
                                Login
                            </button>
                        </Link>
                        <Link href="/register" style={{ textDecoration: 'none' }}>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 22px', background: '#FF8C42',
                                border: 'none', cursor: 'pointer',
                                color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
                                borderRadius: '10px', minHeight: '44px',
                                transition: 'background 150ms ease',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#D94E1F')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#FF8C42')}
                            >
                                <UserPlus size={16} />
                                Join Now
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="show-mobile"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '8px', color: '#8B7355', minHeight: '44px',
                        }}
                        aria-label="Open Menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Mobile Side Drawer — rendered OUTSIDE the nav to avoid stacking context trap */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        background: 'rgba(44, 36, 22, 0.4)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        animation: 'fadeIn 200ms ease-out',
                    }}
                >
                    {/* Drawer Panel */}
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#FFFFFF',
                            width: '85vw', maxWidth: '340px',
                            height: '100%',
                            padding: '24px',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '-4px 0 24px rgba(44, 36, 22, 0.12)',
                            animation: 'slideInRight 250ms ease-out',
                        }}
                    >
                        {/* Drawer Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0E4D7', paddingBottom: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', background: '#FF8C42', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '18px' }}>S</span>
                                </div>
                                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '20px', color: '#2C2416' }}>SpeakOrange Academy</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#8B7355' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '12px 14px', borderRadius: '10px',
                                        textDecoration: 'none', color: '#2C2416',
                                        fontSize: '16px', fontWeight: 500,
                                        transition: 'background 150ms ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#FFF9F4')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <link.icon size={20} color="#FF8C42" />
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Drawer Footer Actions */}
                        <div style={{ borderTop: '1px solid #F0E4D7', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                                <button style={{
                                    width: '100%', padding: '12px',
                                    background: 'transparent',
                                    border: '1.5px solid #F0E4D7', borderRadius: '10px',
                                    cursor: 'pointer', color: '#2C2416', fontWeight: 500, fontSize: '15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    minHeight: '44px',
                                }}>
                                    <LogIn size={18} />
                                    Login
                                </button>
                            </Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                                <button style={{
                                    width: '100%', padding: '12px',
                                    background: '#FF8C42', border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    minHeight: '44px',
                                }}>
                                    <UserPlus size={18} />
                                    Join Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @media (min-width: 768px) {
                    .hidden-mobile { display: flex !important; }
                    .show-mobile { display: none !important; }
                }
                @media (max-width: 767px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                }
            `}</style>
        </>
    )
}
