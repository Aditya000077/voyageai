import React, { useState } from 'react'
import { Particle } from '../../types'

export const ParticleField: React.FC = () => {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: [
        'rgba(59,130,246,0.7)',
        'rgba(124,58,237,0.6)',
        'rgba(6,182,212,0.7)',
        'rgba(255,255,255,0.4)'
      ][Math.floor(Math.random() * 4)],
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 5
    }))
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`
          }}
        />
      ))}
      {/* Ambient ambient glow circles */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          left: '60%',
          top: '-20%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 550,
          height: 550,
          left: '-10%',
          top: '25%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          left: '40%',
          top: '55%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
    </div>
  )
}
