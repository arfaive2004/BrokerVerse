'use client'

import { useState, useMemo } from 'react'
import { ThreeDCard } from '@/components/ui/3d-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Loader2, Search, SlidersHorizontal, FileDown, AlertCircle, FileWarning } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/lib/api'

type MarginRecord = {
  client_id: string
  stock: string
  trade_type: 'BUY' | 'SELL'
  margin_required: number
  margin_available: number
  margin_status: 'OK' | 'issue'
}

export function MarginReportTable() {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<MarginRecord[]>([]);
    const [clientFilter, setClientFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch('/api/reports/generate-margin-report');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `API Error: ${response.statusText}`);
            }
            
            // Assuming the API returns a CSV file
            const blob = await response.blob();
            const text = await blob.text();
            
            // Parse CSV
            const rows = text.split('\n').slice(1); // remove header
            const data: MarginRecord[] = rows.map(row => {
                const [client_id, stock, trade_type, margin_required, margin_available, margin_status] = row.split(',');
                return {
                    client_id,
                    stock,
                    trade_type: trade_type as 'BUY' | 'SELL',
                    margin_required: parseFloat(margin_required),
                    margin_available: parseFloat(margin_available),
                    margin_status: margin_status as 'OK' | 'issue'
                };
            }).filter(item => item.client_id); // filter out empty rows
            
            setReportData(data);
            toast({
                title: "Report Generated",
                description: "Daily margin report has been successfully generated.",
            });

        } catch (err: any) {
            const errorMessage = err.message || 'An unexpected error occurred.';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Report Generation Failed',
                description: errorMessage,
            })
        } finally {
            setIsLoading(false);
        }
    }

    const filteredData = useMemo(() => {
        return reportData.filter(record => {
            return (
                record.client_id.toLowerCase().includes(clientFilter.toLowerCase()) &&
                record.stock.toLowerCase().includes(stockFilter.toLowerCase()) &&
                (statusFilter === 'all' || record.margin_status === statusFilter)
            )
        })
    }, [reportData, clientFilter, stockFilter, statusFilter]);

    const downloadCSV = () => {
        const headers = ['Client ID', 'Stock', 'Trade Type', 'Margin Required', 'Margin Available', 'Status'];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + filteredData.map(e => `${e.client_id},${e.stock},${e.trade_type},${e.margin_required},${e.margin_available},${e.margin_status}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Margin_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if(reportData.length === 0) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : error ? (
                    <>
                        <div className="text-destructive flex items-center gap-2"><AlertCircle /><span>{error}</span></div>
                        <Button size="lg" onClick={handleGenerateReport}>Retry</Button>
                    </>
                ) : (
                    <>
                        <Button size="lg" onClick={handleGenerateReport}>Generate Daily Margin Report</Button>
                        <p className="text-muted-foreground mt-4 text-sm">Click to generate the latest margin report.</p>
                    </>
                )}
            </div>
        )
    }

    return (
        <ThreeDCard>
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-lg font-headline">
                            <SlidersHorizontal className="h-5 w-5"/>
                            <span>Margin Details</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter by Client ID..." className="pl-8 w-full md:w-[200px]" value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
                            </div>
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter by Stock..." className="pl-8 w-full md:w-[200px]" value={stockFilter} onChange={e => setStockFilter(e.target.value)} />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="OK">OK</SelectItem>
                                    <SelectItem value="issue">Issue</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={downloadCSV}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredData.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client ID</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Trade Type</TableHead>
                                    <TableHead className="text-right">Margin Required</TableHead>
                                    <TableHead className="text-right">Margin Available</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((record, index) => (
                                    <TableRow key={index} className={cn(record.margin_status === 'issue' && 'bg-destructive/10 hover:bg-destructive/20')}>
                                        <TableCell className="font-medium">{record.client_id}</TableCell>
                                        <TableCell>{record.stock}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(record.trade_type === 'BUY' ? 'bg-primary/15 text-primary border-primary/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30')}>{record.trade_type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(record.margin_required)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(record.margin_available)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={record.margin_status === 'OK' ? 'success' : 'destructive'}>
                                                {record.margin_status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-4">
                            <FileWarning className="h-10 w-10" />
                            <p>No records found for the selected filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ThreeDCard>
    )
}
