'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Award, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>

      {/* ── Hero Section ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 40px' }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '5%',
          width: '400px', height: '400px',
          background: 'rgba(255, 140, 66, 0.08)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0', right: '5%',
          width: '300px', height: '300px',
          background: 'rgba(217, 78, 31, 0.05)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '28px',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'rgba(255, 140, 66, 0.10)',
            border: '1px solid rgba(255, 140, 66, 0.25)',
            color: '#FF8C42', fontSize: '14px', fontWeight: 600,
            fontFamily: 'Work Sans, sans-serif',
          }}>
            <Award size={15} />
            Top Rated Academy in 2024
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            lineHeight: 1.1,
            color: '#2C2416',
            margin: 0,
          }}>
            Empowering Your Child&apos;s{' '}
            <em style={{ color: '#FF8C42', fontStyle: 'italic' }}>Voice</em>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#8B7355',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: 0,
          }}>
            At SpeakOrange Academy, we build confidence through communication. Expert-led courses in public speaking, creative writing, and social intelligence.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', background: '#FF8C42',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '17px',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,140,66,0.30)',
                transition: 'all 150ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#D94E1F'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FF8C42'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Begin Journey <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', background: '#fff',
                color: '#2C2416', border: '2px solid #F0E4D7', borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '17px',
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF8C42')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#F0E4D7')}
              >
                Student Login
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: '0', marginTop: '48px',
            border: '1px solid #F0E4D7', borderRadius: '16px',
            overflow: 'hidden', background: '#fff',
            boxShadow: '0 4px 16px rgba(44,36,22,0.06)',
          }}>
            {[
              { value: '500+', label: 'Students' },
              { value: '12+', label: 'Courses' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: '24px 48px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid #F0E4D7' : 'none',
              }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#FF8C42' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards / Courses Section ── */}
      <section id="courses" style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* 3-column grid via inline flex / equal thirds */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: <BookOpen size={26} />,
                title: 'Structured Learning',
                desc: 'Scientifically designed curriculum focused on age-appropriate milestone development.',
              },
              {
                icon: <Users size={26} />,
                title: 'Small Batch Sizes',
                desc: 'Maximum interaction with single-digit student counts ensuring personal attention.',
              },
              {
                icon: <CheckCircle2 size={26} />,
                title: 'Performance Tracked',
                desc: 'Regular feedback reports and showcase events to track your child\'s progress.',
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: '#fff',
                  border: '1px solid #F0E4D7',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 8px rgba(44,36,22,0.05)',
                  transition: 'all 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(44,36,22,0.10)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,140,66,0.40)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(44,36,22,0.05)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#F0E4D7';
                }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  background: 'rgba(255, 140, 66, 0.10)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FF8C42', marginBottom: '24px',
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  fontSize: '1.125rem', color: '#2C2416', marginBottom: '10px',
                }}>
                  {card.title}
                </h3>
                <p style={{ color: '#8B7355', lineHeight: 1.7, fontSize: '0.9375rem', margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner / About Section ── */}
      <section id="about" style={{ padding: '0 24px' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          background: 'linear-gradient(135deg, #FF8C42 0%, #D94E1F 100%)',
          borderRadius: '24px',
          padding: 'clamp(40px, 6vw, 72px)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '24px',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#fff', margin: '0 0 8px' }}>
              Ready to transform your child's future?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', margin: 0 }}>
              Join 500+ students already growing at SpeakOrange Academy.
            </p>
          </div>
          <Link href="/register" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button style={{
              padding: '14px 32px',
              background: '#fff', color: '#FF8C42',
              border: 'none', borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '16px',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              transition: 'all 150ms ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Enrol Now →
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
