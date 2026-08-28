'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle2, XCircle, UserCheck, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationResult = {
  status: 'success' | 'failed'
  data?: {
    Name: string
    "Father's Name"?: string
    DOB?: string
    "Date of Birth"?: string
    "PAN Number": string
    Address: string
    verificationStatus?: string
    "PAN Number (Masked)"?: string
  }
  reason?: string
  message?: string
}

type ResultModalProps = {
  result: VerificationResult
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResultModal({ result, open, onOpenChange }: ResultModalProps) {
  const isSuccess = result.status === 'success'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-md p-0 overflow-hidden",
        "before:absolute before:inset-0 before:-z-10 before:transition-all before:duration-500",
        isSuccess 
          ? "before:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(110,231,183,0.3),transparent)]" 
          : "before:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(252,165,165,0.3),transparent)]"
      )}>
        <div className={cn(
          "absolute inset-x-0 top-0 h-1",
          isSuccess ? "bg-success" : "bg-destructive",
          "animate-pulse"
        )}></div>

        <DialogHeader className="p-8 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
                {isSuccess ? <UserCheck className="h-10 w-10 text-success" /> : <UserX className="h-10 w-10 text-destructive" />}
            </div>
          <DialogTitle className="text-2xl font-headline">{isSuccess ? 'Verification Successful' : 'Verification Failed'}</DialogTitle>
          <DialogDescription>
            {isSuccess
              ? (result.message || 'The client has been successfully onboarded.')
              : (result.reason || result.message || 'An unknown error occurred.')}
          </DialogDescription>
        </DialogHeader>

        {isSuccess && result.data && (
          <div className="px-8 text-sm">
            <div className="rounded-lg border bg-background/50 p-4 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{result.data.Name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PAN:</span> <span className="font-medium font-mono">{result.data['PAN Number (Masked)'] || result.data['PAN Number']}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{result.data.DOB || result.data['Date of Birth']}</span></div>
            </div>
          </div>
        )}

        <DialogFooter className="bg-muted/50 p-4 mt-8">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {isSuccess ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
