// Tooltip Komponente - CASCADE konform
// Einfacher Hover-Text für Icons und Elemente

'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap",
            "bg-[var(--primary)] text-[var(--bg-primary)]",
            "shadow-md animate-in fade-in-0 zoom-in-95 duration-100",
            positionClasses[position],
            className
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-[var(--primary)] rotate-45",
              position === 'top' && "top-full left-1/2 -translate-x-1/2 -mt-1",
              position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
              position === 'left' && "left-full top-1/2 -translate-y-1/2 -ml-1",
              position === 'right' && "right-full top-1/2 -translate-y-1/2 -mr-1",
            )}
          />
        </div>
      )}
    </div>
  )
}
