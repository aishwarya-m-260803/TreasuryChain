import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { ArrowLeft, Loader2, XCircle, Receipt, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function ExpenseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getExpenses, isLoading } = useTreasuryApi();
    
    const [expense, setExpense] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchExpenseDetails() {
            // Fetch all expenses and filter locally since there is no specific getExpenseById API yet
            const expensesList = await getExpenses();
            if (isMounted) {
                if (expensesList) {
                    const found = expensesList.find(e => e.Key === id);
                    if (found) {
                        setExpense(found);
                    } else {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            }
        }
        
        fetchExpenseDetails();
        
        return () => { isMounted = false; };
    }, [id, getExpenses]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
        });
    };

    if (isLoading && !expense) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Loading expense record...</BodyText>
                </Stack>
            </div>
        );
    }

    if (error || (!isLoading && !expense)) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <GlassCard className="p-8 text-center max-w-md border-dashed">
                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-4 opacity-50" />
                    <SectionTitle className="text-xl mb-2">Expense Not Found</SectionTitle>
                    <p className="text-muted-foreground text-sm mb-6">
                        The expense record {id} could not be located in the ledger.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard/expenses')}>
                        Back to Expenses
                    </Button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/dashboard/expenses')}
                        className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Expense Records
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Receipt className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Expense Record</h1>
                        <Badge variant="success" className="text-xs uppercase tracking-wider px-2 py-0.5 ml-2">
                            Executed
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm ml-14">Tx ID: {expense.Key}</p>
                </div>
            </div>

            <Grid columns={3} gap="lg">
                {/* Main Details */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <SectionTitle className="text-xl mb-6">Disbursement Details</SectionTitle>
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Disbursed Amount</h3>
                                <p className="text-4xl font-bold text-white">
                                    {formatCurrency(expense.Record.amount)}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Purpose</h3>
                                    <p className="text-white">
                                        {expense.Record.purpose || 'Treasury Disbursement'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Execution Date</h3>
                                    <p className="text-white">
                                        {formatDate(expense.Record.date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <SectionTitle className="text-lg mb-6">Linked Proposal</SectionTitle>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Proposal ID</span>
                                <div className="text-lg font-bold text-white mb-3">
                                    {expense.Record.proposalId}
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full gap-2 border-primary/20 hover:bg-primary/10"
                                    onClick={() => navigate(`/dashboard/proposals/${expense.Record.proposalId}`)}
                                >
                                    View Proposal <ArrowUpRight className="h-3 w-3" />
                                </Button>
                            </div>
                            
                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span>Consensus reached</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span>Funds disbursed via smart contract</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </Grid>
        </div>
    );
}
