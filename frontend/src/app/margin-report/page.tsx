import { MainLayout } from '@/components/main-layout'
import { MarginReportTable } from '@/components/margin-report/margin-report-table'
import { AuthGate } from '@/components/auth-gate'
import { FileText } from 'lucide-react'

export default function MarginReportPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4 md:items-center">
             <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Daily Margin Report</h1>
                <p className="text-muted-foreground">Generate and review daily margin reports for all clients.</p>
            </div>
        </div>
        <AuthGate>
          <MarginReportTable />
        </AuthGate>
      </div>
    </MainLayout>
  )
}
