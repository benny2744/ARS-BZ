
"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle,
  Users
} from "lucide-react"

interface SessionStatusProps {
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  participantCount?: number
  showIcon?: boolean
  className?: string
}

export function SessionStatus({ 
  status, 
  participantCount, 
  showIcon = true,
  className 
}: SessionStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING':
        return {
          label: 'Waiting to start',
          variant: 'secondary' as const,
          icon: Clock
        }
      case 'ACTIVE':
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: Play
        }
      case 'PAUSED':
        return {
          label: 'Paused',
          variant: 'outline' as const,
          icon: Pause
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          variant: 'destructive' as const,
          icon: CheckCircle
        }
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: Clock
        }
    }
  }

  const { label, variant, icon: Icon } = getStatusConfig(status)

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <Badge variant={variant} className="flex items-center space-x-1">
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{label}</span>
      </Badge>
      
      {participantCount !== undefined && (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {participantCount === 1 ? '1 participant' : `${participantCount} participants`}
          </span>
        </div>
      )}
    </div>
  )
}
