import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-lg'
      case 'lg':
        return 'px-8 py-4 text-base rounded-xl font-bold'
      case 'md':
      default:
        return 'px-5 py-2.5 text-sm rounded-xl font-semibold'
    }
  }

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#F8FAFC'
        }
      case 'outline':
        return {
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#3B82F6'
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: 'rgba(248, 250, 252, 0.7)'
        }
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
          color: '#ffffff',
          boxShadow: '0 0 24px rgba(59, 130, 246, 0.35)'
        }
    }
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
        fullWidth ? 'w-full' : ''
      } ${getSizeClass()} ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        ...getVariantStyles(),
        ...style
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.55)'
          e.currentTarget.style.transform = 'scale(1.02)'
        } else if (variant === 'outline') {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.18)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.35)'
          e.currentTarget.style.transform = 'scale(1)'
        } else if (variant === 'outline') {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
        }
      }}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
