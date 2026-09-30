import React, { useState } from 'react'
import { Sparkles, Menu, X, User } from 'lucide-react'
import { useApiStatus } from '../../hooks/useApiStatus'

interface NavProps {
  scrolled: boolean
  onOpenPlanner: () => void
  onOpenSignIn: () => void
}

export const Nav: React.FC<NavProps> = ({ scrolled, onOpenPlanner, onOpenSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { status: apiStatus } = useApiStatus(30000)


  const navLinks = [
    { name: 'Discover', href: '#hero' },
    { name: 'Destinations', href: '#destinations' },
    { name: 'Smart Nav', href: '#smart-nav' },
    { name: 'AI Engines', href: '#features' },
    { name: 'Mission Control', href: '#mission-control' },
    { name: 'Reviews', href: '#testimonials' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(2, 6, 23, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.45)',
            }}
          >
            <Sparkles size={18} className="text-white animate-pulse" />
          </div>
          <span
            className="text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Voyage<span className="gradient-text-blue">AI</span>
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontFamily: 'var(--font-mono)',
            }}
          >
            GLOBAL EDITION
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200 text-slate-300 hover:text-white"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Backend API live status indicator — polls every 30s */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${apiStatus !== 'checking' ? 'blink' : ''}`}
              style={{
                background: apiStatus === 'online' ? '#10B981' : apiStatus === 'offline' ? '#EF4444' : '#F59E0B',
                boxShadow: `0 0 6px ${apiStatus === 'online' ? '#10B981' : apiStatus === 'offline' ? '#EF4444' : '#F59E0B'}`,
              }}
            />
            <span
              className="text-[10px] font-mono font-semibold"
              style={{ color: apiStatus === 'online' ? '#10B981' : apiStatus === 'offline' ? '#EF4444' : '#F59E0B' }}
            >
              API {apiStatus === 'online' ? 'ONLINE' : apiStatus === 'offline' ? 'OFFLINE' : 'CHECKING…'}
            </span>
          </div>

          <button
            onClick={onOpenSignIn}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <User size={15} className="text-amber-400" />
            Sign In
          </button>

          <button
            onClick={onOpenPlanner}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white cursor-pointer transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 0 20px rgba(245,158,11,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.6)'
              e.currentTarget.style.transform = 'scale(1.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.35)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Sparkles size={16} />
            Plan World Trip
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-6 py-6 space-y-4 animate-fade-in backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-200 hover:text-blue-400 py-1"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenPlanner()
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-xl text-white"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Sparkles size={16} />
              Start Journey with AI
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
