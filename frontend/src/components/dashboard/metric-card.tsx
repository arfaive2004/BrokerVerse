'use client'

import { ThreeDCard } from '@/components/ui/3d-card'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  icon: keyof typeof LucideIcons
  title: string
  value: string
  change?: string
  changeType?: 'increase' | 'decrease'
  valueClassName?: string
}

export function MetricCard({ icon, title, value, change, changeType, valueClassName }: MetricCardProps) {
  const Icon = LucideIcons[icon] as LucideIcons.LucideIcon

  return (
    <ThreeDCard>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon && <Icon className="size-5 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold font-code", valueClassName)}>{value}</div>
          {change && (
            <p className={cn("text-xs text-muted-foreground", changeType === 'increase' ? 'text-success' : 'text-destructive')}>
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </ThreeDCard>
  )
}
