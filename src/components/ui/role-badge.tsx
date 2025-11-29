'use client'

import { ReactNode } from 'react'
import { Crown, Briefcase, User } from 'lucide-react'
import { Icon } from '@/components/ui/icon'

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          icon: Crown,
          color: 'text-warning',
          label: 'Administrator'
        }
      case 'MANAGER':
        return {
          icon: Briefcase,
          color: 'text-info',
          label: 'Manager'
        }
      case 'USER':
        return {
          icon: User,
          color: 'text-secondary',
          label: 'Benutzer'
        }
      default:
        return {
          icon: User,
          color: 'text-secondary',
          label: role
        }
    }
  }

  const { icon, color, label } = getRoleInfo(role)

  return (
    <div className={`${color} ${className}`}>
      <Icon icon={icon} size="md" color={undefined} />
    </div>
  )
}
