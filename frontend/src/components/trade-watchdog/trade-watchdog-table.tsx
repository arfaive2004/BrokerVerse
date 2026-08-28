'use client'

import { useState, useMemo } from 'react'
import { ThreeDCard } from '@/components/ui/3d-card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, FileWarning, AlertCircle, FileDown } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/lib/api'

export function TradeWatchdogTable() {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleRunCheck = async () => {
        setIsLoading(true);
        setError(null);
        setPdfUrl(null);
        try {
            const response = await apiFetch('/api/surveillance/run-check');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.statusText}`);
            }

            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'Suspicious_Activity_Report.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);

            toast({
                title: "Report Generated",
                description: "Suspicious activity report is ready for download.",
            });

        } catch (err: any) {
            const errorMessage = err.message || 'An unexpected error occurred.';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Surveillance Check Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            {isLoading && (
                <div className="flex flex-col items-center gap-4 text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Scanning for suspicious activities...</p>
                </div>
            )}
            
            {!isLoading && !pdfUrl && (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    {error ? (
                        <>
                            <div className="text-destructive flex items-center gap-2"><AlertCircle /><span>{error}</span></div>
                            <Button size="lg" onClick={handleRunCheck}>Retry</Button>
                        </>
                    ) : (
                        <>
                            <Button size="lg" onClick={handleRunCheck} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                Run Surveillance Check
                            </Button>
                            <p className="text-muted-foreground mt-4 text-sm">Click to scan for potentially suspicious trading activities.</p>
                        </>
                    )}
                </div>
            )}

            {pdfUrl && !isLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ThreeDCard>
                        <Card className="border-0 shadow-none bg-transparent">
                            <CardContent className="pt-6 text-center flex flex-col items-center gap-4">
                                <FileWarning className="h-12 w-12 text-primary" />
                                <h3 className="text-xl font-bold font-headline">Report Generated</h3>
                                <p className="text-muted-foreground">The suspicious activity report is ready.</p>
                                <a href={pdfUrl} download="Suspicious_Activity_Report.pdf">
                                    <Button size="lg">
                                        <FileDown className="mr-2 h-5 w-5" />
                                        Download Report
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </ThreeDCard>
                </motion.div>
            )}
        </div>
    );
}

// Helper component for animation
const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>
};
