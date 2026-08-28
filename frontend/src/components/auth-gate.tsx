'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="font-headline">Sign in required</CardTitle>
          <CardDescription>
            Create a free account or sign in to add your own clients and run this tool with your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="w-full sm:w-auto">Create an account</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
