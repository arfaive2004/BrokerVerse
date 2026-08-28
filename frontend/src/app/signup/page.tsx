'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [brokerName, setBrokerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signup(fullName, email, password, brokerName)
      toast({ title: 'Account created', description: 'Welcome to BrokerVerse!' })
      router.push('/')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: err.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center gap-2">
            <Icons.logo className="size-8 text-primary" />
            <span className="text-xl font-headline font-semibold">BrokerVerse</span>
          </div>
          <CardTitle className="font-headline text-2xl">Create your account</CardTitle>
          <CardDescription>Start onboarding clients and running compliance checks of your own.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerName">Brokerage name (optional)</Label>
              <Input id="brokerName" type="text" placeholder="Doe Securities" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@brokerage.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create account
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <Link href="/" className="text-xs text-muted-foreground hover:underline">
              ← Back to the demo dashboard
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
