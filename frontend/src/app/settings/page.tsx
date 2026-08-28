'use client'
import { MainLayout } from '@/components/main-layout'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
export default function SettingsPage(){const {user}=useAuth();return <MainLayout><div className='max-w-2xl space-y-6'><div><h1 className='text-3xl font-bold'>Settings</h1><p className='text-muted-foreground'>Manage your BrokerVerse account.</p></div><Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className='space-y-2'>{user?<><p><b>Name:</b> {user.full_name}</p><p><b>Email:</b> {user.email}</p><p><b>Brokerage:</b> {user.broker_name || 'Not set'}</p></>:<><p>Sign in to manage your account.</p><Link href='/login'><Button>Sign In</Button></Link></>}</CardContent></Card></div></MainLayout>}
