'use client'

import { useEffect, useState } from 'react'
import { ThreeDCard } from '@/components/ui/3d-card'
import { CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

type TopClient = {
  rank: number
  name: string
  profit: number
  status: 'Up' | 'Down'
}

const fallbackClients: TopClient[] = [
  { rank: 1, name: 'Ashok Kumar', profit: 520345.78, status: 'Up' },
  { rank: 2, name: 'Priya Sharma', profit: 480912.45, status: 'Up' },
  { rank: 3, name: 'Rahul Verma', profit: 450123.90, status: 'Down' },
  { rank: 4, name: 'Sunita Singh', profit: 399876.12, status: 'Up' },
  { rank: 5, name: 'Vikram Mehta', profit: 350654.32, status: 'Down' },
]

export function TopClientsCard() {
  const { user } = useAuth()
  const [clients, setClients] = useState<TopClient[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadTopClients() {
      setIsLoading(true)
      try {
        const response = await apiFetch('/api/dashboard/top-clients')
        if (!response.ok) throw new Error('Failed to load top clients')
        const data = await response.json()
        if (!cancelled) setClients(data)
      } catch (err) {
        console.error(err)
        if (!cancelled) setClients(user ? [] : fallbackClients)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadTopClients()
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <ThreeDCard className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Top 5 Clients by Profit</CardTitle>
        <CardDescription>
          {user ? 'Your highest profit generating clients.' : 'Highest profit generating clients today.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !clients ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? <TableRow><TableCell colSpan={4} className='py-10 text-center text-muted-foreground'>No clients yet. Onboard your first client to start building your dashboard.</TableCell></TableRow> : clients.map((client) => (
                <TableRow key={client.rank}>
                  <TableCell className="font-medium">{client.rank}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(client.profit)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={client.status === 'Up' ? 'success' : 'destructive'}>{client.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </ThreeDCard>
  )
}
