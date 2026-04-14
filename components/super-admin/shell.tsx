'use client'

import React, { useState } from 'react'
import Sidebar from './sidebar'
import Navbar from './navbar'

export default function SuperAdminShell({
    children,
    adminName = ''
}: {
    children: React.ReactNode,
    adminName?: string
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div
                className="flex-1 transition-all"
                style={{
                    flex: 1,
                    marginLeft: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                }}
                id="main-content"
            >
                <Navbar adminName={adminName} onMenuClick={() => setIsSidebarOpen(true)} />

                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>

            <style jsx>{`
        @media (max-width: 1024px) {
          #main-content { margin-left: 0 !important; }
        }
      `}</style>
        </div>
    )
}
