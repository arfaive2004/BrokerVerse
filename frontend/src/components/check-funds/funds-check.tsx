'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThreeDCard } from '@/components/ui/3d-card'
import { Loader2, ShieldCheck, ShieldAlert, Sparkles, AlertCircle, Upload, FileUp } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type FundsResult = {
  status: 'PASS' | 'FAIL'
  surplus: string
  actual_balance?: string
  required_funds?: string
}

export function FundsCheck() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FundsResult | null>(null)
  const [bankStatement, setBankStatement] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv') {
        setBankStatement(file)
        setError(null)
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a CSV file.',
        })
        setBankStatement(null)
      }
    }
  }

  const handleCheckFunds = async () => {
    if (!bankStatement) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please upload a bank statement CSV file.',
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('bank_statement', bankStatement)

    try {
      const response = await apiFetch('/api/compliance/check-funds', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.statusText}`)
      }

      const data: FundsResult = await response.json()
      setResult(data)
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred.'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Funds Check Failed',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>Upload Bank Statement</CardTitle>
            <CardDescription>Upload a CSV with columns like `date,description,credit,debit` (or `amount,type`) to check for fund sufficiency.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="bank-statement">Bank Statement (CSV)</Label>
                <Input id="bank-statement" type="file" accept=".csv" onChange={handleFileChange} />
            </div>
            <Button size="lg" onClick={handleCheckFunds} disabled={isLoading || !bankStatement}>
                {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                <Sparkles className="mr-2 h-5 w-5" />
                )}
                Run Funds Check
            </Button>
        </CardContent>
      </Card>


      {error && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-destructive flex items-center gap-2">
                <AlertCircle />
                <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleCheckFunds}>Retry</Button>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <ThreeDCard className="w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl">Funds Compliance Report</h3>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold',
                    result.status === 'PASS'
                      ? 'bg-success/15 text-success'
                      : 'bg-destructive/15 text-destructive'
                  )}
                >
                  {result.status === 'PASS' ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  {result.status}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {result.actual_balance && result.required_funds && (
                  <>
                    <div className="flex justify-between items-baseline">
                      <p className="text-muted-foreground">Actual Balance</p>
                      <p className="font-mono text-lg font-medium">{formatCurrency(result.actual_balance)}</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <p className="text-muted-foreground">Required Funds</p>
                      <p className="font-mono text-lg font-medium">{formatCurrency(result.required_funds)}</p>
                    </div>
                    <div className="my-4 border-t border-dashed border-border"></div>
                  </>
                )}
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-lg">{result.status === 'PASS' ? 'Surplus' : 'Deficit'}</p>
                  <p className={cn(
                    'font-mono text-2xl font-bold',
                    result.status === 'PASS' ? 'text-success' : 'text-destructive'
                  )}>{formatCurrency(result.surplus)}</p>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </motion.div>
      )}
    </div>
  )
}
