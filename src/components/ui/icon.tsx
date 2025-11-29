'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: string
}

export function Icon({ icon: IconComponent, size = 'md', className = '', color }: IconProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  }

  const fontSize = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem', 
    xl: '1.75rem'
  }

  return (
    <div 
      className={`${className}`}
      style={{ 
        fontSize: fontSize[size],
        color: color || 'inherit'
      }}
    >
      <IconComponent className={sizeClasses[size]} />
    </div>
  )
}
