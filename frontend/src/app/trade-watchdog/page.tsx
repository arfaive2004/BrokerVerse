import { MainLayout } from '@/components/main-layout'
import { TradeWatchdogTable } from '@/components/trade-watchdog/trade-watchdog-table'
import { AuthGate } from '@/components/auth-gate'
import { ShieldCheck } from 'lucide-react'

export default function TradeWatchdogPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4 md:items-center">
             <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Trade Watchdog</h1>
                <p className="text-muted-foreground">Monitor and investigate potentially suspicious trading activities.</p>
            </div>
        </div>
        <AuthGate>
          <TradeWatchdogTable />
        </AuthGate>
      </div>
    </MainLayout>
  )
}
