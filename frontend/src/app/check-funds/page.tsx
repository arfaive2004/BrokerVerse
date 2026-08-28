import { MainLayout } from '@/components/main-layout'
import { FundsCheck } from '@/components/check-funds/funds-check'
import { AuthGate } from '@/components/auth-gate'
import { DollarSign } from 'lucide-react'

export default function CheckFundsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4 md:items-center">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <DollarSign className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Client Funds Checker</h1>
                <p className="text-muted-foreground">Verify if client funds meet the required margin in real-time.</p>
            </div>
        </div>
        <AuthGate>
          <FundsCheck />
        </AuthGate>
      </div>
    </MainLayout>
  )
}
