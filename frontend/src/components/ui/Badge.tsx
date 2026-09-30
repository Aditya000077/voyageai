import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'solid' | 'outline' | 'subtle'
  className?: string
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = '#3B82F6',
  variant = 'subtle',
  className = '',
  style = {}
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          background: color,
          color: '#ffffff',
          border: '1px solid transparent'
        }
      case 'outline':
        return {
          background: 'transparent',
          color: color,
          border: `1px solid ${color}66`
        }
      case 'subtle':
      default:
        return {
          background: `${color}18`,
          border: `1px solid ${color}35`,
          color: color
        }
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${className}`}
      style={{
        fontFamily: 'var(--font-mono)',
        backdropFilter: 'blur(8px)',
        ...getStyles(),
        ...style
      }}
    >
      {children}
    </span>
  )
}
