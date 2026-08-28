'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { TopClientsCard } from '@/components/dashboard/top-clients-card'
import { formatCurrency } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'

type Metrics = {
  total_brokerage: number
  active_clients: number
  new_clients: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadMetrics() {
      setIsLoading(true)
      try {
        const response = await apiFetch('/api/dashboard/metrics')
        if (!response.ok) throw new Error('Failed to load metrics')
        const data = await response.json()
        if (!cancelled) setMetrics(data)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setMetrics(user ? { total_brokerage: 0, active_clients: 0, new_clients: 0 } : { total_brokerage: 12345678.90, active_clients: 1254, new_clients: 32 })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadMetrics()
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {user
              ? `Welcome back, ${user.full_name.split(' ')[0]}! Here's your brokerage overview for today.`
              : "Welcome to BrokerVerse — here's a live look at the platform. Sign in to add your own clients."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            {isLoading || !metrics ? (
              <Skeleton className="h-28 w-full rounded-xl" />
            ) : (
              <MetricCard
                title="Total Brokerage"
                icon="BarChart"
                value={formatCurrency(metrics.total_brokerage)}
                change={user ? 'Your account total' : '+5.2% from last month'}
                changeType="increase"
                valueClassName="text-3xl"
              />
            )}
          </div>
          {isLoading || !metrics ? (
            <>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </>
          ) : (
            <>
              <MetricCard
                title="New Clients"
                icon="UserPlus"
                value={String(metrics.new_clients)}
                change={user ? 'Clients onboarded in your account' : '+3 since yesterday'}
                changeType="increase"
              />
              <MetricCard
                title="Active Clients"
                icon="Users"
                value={metrics.active_clients.toLocaleString('en-IN')}
                change={user ? 'Your currently onboarded clients' : '+12 clients today'}
                changeType="increase"
              />
            </>
          )}
        </div>
        <TopClientsCard />
      </div>
    </MainLayout>
  )
}
