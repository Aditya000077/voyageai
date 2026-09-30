import React from 'react'
import { Sparkles, Globe, ShieldCheck, Share2, Send, MessageSquare } from 'lucide-react'

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Product',
      links: ['AI Planner', 'Destinations', 'Concierge AI', 'Predictive Pricing', 'Enterprise VIP']
    },
    {
      title: 'Company',
      links: ['About Us', 'Engineering Blog', 'Careers (Hiring!)', 'Press Kit', 'Contact Us']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Preferences', 'Security Center', 'GDPR Compliance']
    }
  ]

  return (
    <footer
      className="relative py-16 border-t overflow-hidden"
      style={{ borderColor: 'rgba(255, 255, 255, 0.08)', background: '#020617' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}
              >
                <Sparkles size={18} />
              </div>
              <span
                className="text-xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Voyage<span className="gradient-text-blue">AI</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs text-slate-400 mb-6"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Worldwide AI travel intelligence platform. Crafting seamless, hyper-personalized luxury journeys in seconds.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: '#' },
                { icon: Share2, href: '#' },
                { icon: Send, href: '#' },
                { icon: MessageSquare, href: '#' }
              ].map((social, i) => {
                const Icon = social.icon
                return (
                  <a
                    key={i}
                    href={social.href}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((sec) => (
            <div key={sec.title}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-400"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {sec.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {sec.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4 border-t border-slate-800/80"
        >
          <p
            className="text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            © 2026 VoyageAI Inc. All rights reserved. · Mission Control v3.2.1
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full blink bg-emerald-400"
              style={{ boxShadow: '0 0 8px #10B981' }}
            />
            <span
              className="text-xs text-slate-400 font-semibold"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ALL 6 AI ENGINES OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
