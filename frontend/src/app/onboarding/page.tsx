import { MainLayout } from '@/components/main-layout'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'
import { AuthGate } from '@/components/auth-gate'
import { UserPlus } from 'lucide-react'

export default function OnboardingPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-4 md:items-center">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <UserPlus className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">New User Onboarding</h1>
                <p className="text-muted-foreground">Fill the KYC form to onboard a new client using their documents.</p>
            </div>
        </div>
        <AuthGate>
          <OnboardingForm />
        </AuthGate>
      </div>
    </MainLayout>
  )
}
