import React, { useEffect, useState } from 'react';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Landmark, ArrowDownRight, Wallet, Receipt, Loader2, Activity } from 'lucide-react';

export function ReserveView() {
    const { getSummary, getExpenses, isLoading } = useTreasuryApi();
    
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchData() {
            const [summaryData, expensesData] = await Promise.all([
                getSummary(),
                getExpenses()
            ]);
            
            if (isMounted) {
                if (summaryData) setSummary(summaryData);
                if (expensesData) setExpenses(expensesData);
            }
        }
        
        fetchData();
        
        return () => { isMounted = false; };
    }, [getSummary, getExpenses]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Calculate dynamic values
    const currentBalance = summary?.treasuryBalance || 0;
    const totalExpenses = summary?.totalAmountSpent || 0;
    const initialReserve = currentBalance + totalExpenses;
    const remainingPercentage = initialReserve > 0 ? Math.round((currentBalance / initialReserve) * 100) : 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Treasury Reserve</h1>
                <p className="text-muted-foreground">
                    Monitor live treasury funds, historical allocations, and reserve activity.
                </p>
            </div>

            {/* Summary Cards */}
            <Grid columns={4} gap="md" className="auto-rows-fr">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Landmark className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? formatCurrency(currentBalance) : '$---'}
                    </div>
                    <p className="text-xs text-muted-foreground">Current Reserve Balance</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? formatCurrency(initialReserve) : '$---'}
                    </div>
                    <p className="text-xs text-muted-foreground">Initial Reserve</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <ArrowDownRight className="h-5 w-5 text-destructive" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? formatCurrency(totalExpenses) : '$---'}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Approved Expenses</p>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <Activity className="h-24 w-24 text-emerald-400" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Receipt className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 relative z-10">
                        {summary ? `${remainingPercentage}%` : '---%'}
                    </div>
                    <p className="text-xs text-muted-foreground relative z-10">Remaining Balance</p>
                </GlassCard>
            </Grid>

            <Grid columns={3} gap="lg">
                {/* Main Content */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <GlassCard className="p-6">
                        <SectionTitle className="text-lg mb-6">Reserve Transaction History</SectionTitle>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tx ID</TableHead>
                                        <TableHead>Proposal ID</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && expenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                                    <span>Loading transaction history...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : expenses.length > 0 ? (
                                        expenses.map((exp) => (
                                            <TableRow key={exp.Key}>
                                                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[80px]" title={exp.Key}>
                                                    {exp.Key.substring(0, 10)}...
                                                </TableCell>
                                                <TableCell className="font-medium text-white">{exp.Record.proposalId}</TableCell>
                                                <TableCell className="text-destructive font-medium">-{formatCurrency(exp.Record.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-destructive/20 text-destructive bg-destructive/10">
                                                        Debit
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{formatDate(exp.Record.date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="success">Executed</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Receipt className="h-8 w-8 opacity-40 mb-3" />
                                                    <p className="text-white font-medium mb-1">No Transactions</p>
                                                    <p className="text-sm">The treasury reserve has not disbursed any funds yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <SectionTitle className="text-lg mb-6">Activity Timeline</SectionTitle>
                        
                        <div className="relative border-l border-white/10 ml-3 space-y-8 py-2">
                            {/* Placeholder UI for Timeline */}
                            <div className="relative pl-6">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                                <div className="mb-1 text-sm font-medium text-white">Treasury Initialized</div>
                                <div className="text-xs text-muted-foreground">Network genesis block created. Initial allocation mapped.</div>
                            </div>

                            <div className="relative pl-6 opacity-50">
                                <div className="absolute w-3 h-3 bg-white/20 rounded-full -left-[6.5px] top-1.5" />
                                <div className="mb-1 text-sm font-medium text-white">Awaiting First Disbursement</div>
                                <div className="text-xs text-muted-foreground">No funds have been approved for release yet.</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </Grid>
        </div>
    );
}
