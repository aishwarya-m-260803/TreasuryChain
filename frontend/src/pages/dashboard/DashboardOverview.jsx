import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Landmark, FileText, CheckCircle2, Clock, ShieldCheck, Receipt, ArrowRight, Loader2 } from 'lucide-react';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { Link } from 'react-router-dom';
import { CreateProposalModal } from './components/CreateProposalModal';

export function DashboardOverview() {
    const { user } = useAuth();
    const { getSummary, getProposals, isLoading } = useTreasuryApi();
    
    const [summary, setSummary] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        const [summaryData, proposalsData] = await Promise.all([
            getSummary(),
            getProposals()
        ]);
        if (summaryData) setSummary(summaryData);
        if (proposalsData) setProposals(proposalsData);
    };

    useEffect(() => {
        let isMounted = true;
        
        async function load() {
            const [summaryData, proposalsData] = await Promise.all([
                getSummary(),
                getProposals()
            ]);
            
            if (isMounted) {
                if (summaryData) setSummary(summaryData);
                if (proposalsData) setProposals(proposalsData);
            }
        }
        
        load();
        
        return () => { isMounted = false; };
    }, [getSummary, getProposals]);

    const formatOrgName = (org) => {
        return org.charAt(0).toUpperCase() + org.slice(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };

    if (isLoading && !summary) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Syncing ledger data...</BodyText>
                </Stack>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Welcome, {user.username}
                    </h1>
                    <p className="text-muted-foreground">
                        Authenticated as <strong className="text-white">{user.userIdentity}</strong> for <strong className="text-primary">{formatOrgName(user.organization)}</strong>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2">
                        <FileText className="h-4 w-4" />
                        Create Proposal
                    </Button>
                </div>
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
                        {summary ? formatCurrency(summary.treasuryBalance) : '$---'}
                    </div>
                    <p className="text-xs text-muted-foreground">Current Treasury Reserve</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? summary.pendingProposals + summary.approvedProposals + summary.rejectedProposals : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Proposals</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Clock className="h-5 w-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? summary.pendingProposals : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">Pending Proposals</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary ? summary.approvedProposals : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">Approved Proposals</p>
                </GlassCard>
            </Grid>

            <Grid columns={3} gap="lg">
                {/* Recent Proposals */}
                <div className="col-span-3 lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionTitle className="text-xl">Recent Proposals</SectionTitle>
                        <Link to="/dashboard/proposals" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    
                    <GlassCard className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Votes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proposals.length > 0 ? (
                                        proposals.slice(0, 5).map((prop) => (
                                            <TableRow key={prop.Key}>
                                                <TableCell className="font-medium text-white">{prop.Key}</TableCell>
                                                <TableCell className="text-muted-foreground">{prop.Record.purpose}</TableCell>
                                                <TableCell className="text-white">{formatCurrency(prop.Record.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(prop.Record.status)}>
                                                        {prop.Record.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{prop.Record.votes}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                No proposals found on the ledger.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Actions */}
                <div className="col-span-3 lg:col-span-1 space-y-4">
                    <SectionTitle className="text-xl">Quick Actions</SectionTitle>
                    <div className="grid gap-3">
                        <Link to="/dashboard/proposals">
                            <GlassCard className="p-4 flex items-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Manage Proposals</div>
                                    <div className="text-xs text-muted-foreground">View or create new requests</div>
                                </div>
                            </GlassCard>
                        </Link>
                        
                        <Link to="/dashboard/audit">
                            <GlassCard className="p-4 flex items-center gap-4 hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer group">
                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Audit Logs</div>
                                    <div className="text-xs text-muted-foreground">Review immutable audit trail</div>
                                </div>
                            </GlassCard>
                        </Link>

                        <Link to="/dashboard/expenses">
                            <GlassCard className="p-4 flex items-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group">
                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <Receipt className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Expense Records</div>
                                    <div className="text-xs text-muted-foreground">Track completed payouts</div>
                                </div>
                            </GlassCard>
                        </Link>
                    </div>
                </div>
            </Grid>

            <CreateProposalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }} 
            />
        </div>
    );
}
