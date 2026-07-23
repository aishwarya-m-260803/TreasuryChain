import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Receipt, Search, Filter, Loader2, ArrowRight, Calendar, Calculator, CheckCircle2 } from 'lucide-react';

export function ExpensesView() {
    const { getExpenses, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [expenses, setExpenses] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [dateSort, setDateSort] = useState('NEWEST');

    useEffect(() => {
        let isMounted = true;
        
        async function fetchExpenses() {
            const data = await getExpenses();
            if (isMounted && data) {
                setExpenses(data);
            }
        }
        
        fetchExpenses();
        
        return () => { isMounted = false; };
    }, [getExpenses]);

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

    // Derived summary stats
    const totalAmountSpent = useMemo(() => {
        return expenses.reduce((acc, curr) => acc + (curr.Record.amount || 0), 0);
    }, [expenses]);
    
    const lastExpenseDate = useMemo(() => {
        if (expenses.length === 0) return null;
        // Assuming expenses might not be strictly ordered, find the latest
        const dates = expenses.map(e => new Date(e.Record.date).getTime()).filter(d => !isNaN(d));
        if (dates.length === 0) return null;
        return new Date(Math.max(...dates));
    }, [expenses]);

    // Filter logic
    const filteredExpenses = useMemo(() => {
        let filtered = expenses.filter(exp => {
            const matchesSearch = 
                exp.Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.Record.proposalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.Record.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesSearch;
        });

        if (dateSort === 'NEWEST') {
            filtered.sort((a, b) => new Date(b.Record.date) - new Date(a.Record.date));
        } else {
            filtered.sort((a, b) => new Date(a.Record.date) - new Date(b.Record.date));
        }

        return filtered;
    }, [expenses, searchQuery, dateSort]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Expense Records</h1>
                <p className="text-muted-foreground">
                    Comprehensive ledger of all executed treasury disbursements.
                </p>
            </div>

            {/* Summary Cards */}
            <Grid columns={4} gap="md" className="auto-rows-fr mb-8">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Receipt className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {expenses.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {expenses.length} {/* Assuming all expenses in the ledger are executed */}
                    </div>
                    <p className="text-xs text-muted-foreground">Approved Expenses</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calculator className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(totalAmountSpent)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Amount Spent</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {lastExpenseDate ? lastExpenseDate.toLocaleDateString() : '---'}
                    </div>
                    <p className="text-xs text-muted-foreground">Last Expense Date</p>
                </GlassCard>
            </Grid>

            <GlassCard className="p-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by ID, Proposal ID, or Purpose..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-md text-sm text-white py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        >
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Expense ID</TableHead>
                                <TableHead>Proposal ID</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading expense records...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredExpenses.length > 0 ? (
                                filteredExpenses.map((exp) => (
                                    <TableRow key={exp.Key} className="group">
                                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[80px]" title={exp.Key}>
                                            {exp.Key.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-medium text-white">{exp.Record.proposalId}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate" title={exp.Record.purpose || 'Treasury Disbursement'}>
                                            {exp.Record.purpose || 'Treasury Disbursement'}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">{formatCurrency(exp.Record.amount)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{formatDate(exp.Record.date)}</TableCell>
                                        <TableCell>
                                            <Badge variant="success">Executed</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => navigate(`/dashboard/expenses/${exp.Key}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                            >
                                                Details <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Receipt className="h-8 w-8 mb-3 opacity-20" />
                                            <p className="text-white font-medium mb-1">No Expense Records</p>
                                            <p className="text-sm">There are no disbursed expenses matching your filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>
        </div>
    );
}
