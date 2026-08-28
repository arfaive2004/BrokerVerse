'use client'

import { useState, useEffect, type ReactNode } from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Home,
  FileText,
  DollarSign,
  ShieldCheck,
  UserPlus,
  BarChart2,
  Settings,
  Bell,
  UserX,
} from 'lucide-react'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Skeleton } from './ui/skeleton'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

type ExpiringClient = {
  client_id: string
  full_name: string
  kyc_expiry_date: string
}

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [expiringClients, setExpiringClients] = useState<ExpiringClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const notificationCount = expiringClients.length

  useEffect(() => {
    async function fetchExpiringClients() {
      setIsLoading(true)
      try {
        const response = await apiFetch('/api/kyc/expiring');
        if (!response.ok) {
          throw new Error('Failed to fetch expiring clients');
        }
        const data = await response.json();
        setExpiringClients(data.expiring_clients || [])
      } catch (error) {
        console.error('Failed to fetch expiring clients:', error)
        toast({
          variant: "destructive",
          title: "API Error",
          description: "Could not fetch expiring KYC notifications.",
        });
        setExpiringClients([]) // Set to empty on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpiringClients()
  }, [toast, user])

  const handleNotifyClient = async (clientId: string, clientName: string) => {
    try {
      const response = await apiFetch('/api/clients/notify', {
        method: 'POST',
        body: { client_id: clientId },
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const result = await response.json();

      toast({
        title: "Notification Sent",
        description: result.message || `Notification sent to ${clientName}!`,
      });

      setExpiringClients(prevClients => prevClients.filter(client => client.client_id !== clientId));

    } catch (error) {
      console.error('Failed to send notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification.",
      });
    }
  };

  const handleLogout = () => {
    logout()
    toast({ title: 'Signed out', description: 'You have been signed out.' })
    router.push('/')
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-8 text-primary" />
            <h1 className="text-xl font-headline font-semibold">BrokerVerse</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
           <SidebarMenu>
             <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton isActive={pathname === '/'} tooltip="Dashboard">
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarGroup>
            <SidebarGroupLabel>Core Compliance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/onboarding" passHref>
                  <SidebarMenuButton isActive={pathname === '/onboarding'} tooltip="KYC Form Filler">
                    <UserPlus /><span>KYC Form Filler</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/margin-report" passHref>
                  <SidebarMenuButton isActive={pathname === '/margin-report'} tooltip="Daily Report Generator">
                    <FileText /><span>Daily Report Generator</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/check-funds" passHref>
                  <SidebarMenuButton isActive={pathname === '/check-funds'} tooltip="Client Funds Checker">
                    <DollarSign /><span>Client Funds Checker</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Surveillance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/trade-watchdog" passHref>
                  <SidebarMenuButton isActive={pathname === '/trade-watchdog'} tooltip="Trade Watchdog">
                    <ShieldCheck /><span>Trade Watchdog</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>New Core Compliance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/margin-report" passHref>
                  <SidebarMenuButton isActive={pathname === '/margin-report'} tooltip="Daily Margin Checker">
                    <BarChart2 /><span>Daily Margin Checker</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton isActive={pathname === '/settings'} tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4 ml-auto">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {isLoading ? (
                    <Skeleton className="absolute top-0 right-0 h-5 w-5 rounded-full" />
                  ) : (
                    notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {notificationCount}
                      </span>
                    )
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Expiring KYC</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoading ? (
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : notificationCount > 0 ? (
                  expiringClients.map(client => (
                    <DropdownMenuItem key={client.client_id} onSelect={(e) => { e.preventDefault(); handleNotifyClient(client.client_id, client.full_name); }} className="cursor-pointer flex justify-between items-center">
                      <div>
                        <p className='font-semibold'>{client.full_name}</p>
                        <p className='text-xs text-muted-foreground'>Expires: {new Date(client.kyc_expiry_date).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="ghost">Notify</Button>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="justify-center text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <UserX className="h-8 w-8" />
                      <span>No expiring clients</span>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://picsum.photos/100/100" alt="User" data-ai-hint="person face" />
                      <AvatarFallback>{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.full_name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
