import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Hauptblauer Kreis */}
        <circle cx="50" cy="50" r="45" fill="#4A90E2" />
        
        {/* Lila Akzent */}
        <path 
          d="M 30 50 Q 50 30, 70 50 T 70 70 Q 50 90, 30 70 T 30 50" 
          fill="#7B68EE" 
          opacity="0.8"
        />
        
        {/* Roter Akzent */}
        <circle cx="50" cy="50" r="15" fill="#FF6B6B" opacity="0.9" />
        
        {/* Weiße Elemente für Kontrast */}
        <path 
          d="M 35 35 L 45 45 L 35 55 Z" 
          fill="white" 
          opacity="0.9"
        />
        <path 
          d="M 65 35 L 55 45 L 65 55 Z" 
          fill="white" 
          opacity="0.9"
        />
        
        {/* DWE Text */}
        <text 
          x="50" 
          y="85" 
          textAnchor="middle" 
          fill="white" 
          fontSize="12" 
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          DWE
        </text>
      </svg>
    </div>
  )
}

export default Logo
