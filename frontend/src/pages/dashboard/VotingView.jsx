import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle } from '../../components/typography/Typography';
import { Hammer, Loader2, ArrowRight } from 'lucide-react';

export function VotingView() {
    const { getProposals, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [proposals, setProposals] = useState([]);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchProposals() {
            const data = await getProposals();
            if (isMounted && data) {
                setProposals(data);
            }
        }
        
        fetchProposals();
        
        return () => { isMounted = false; };
    }, [getProposals]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Only show proposals awaiting consensus (PENDING)
    const pendingProposals = useMemo(() => {
        return proposals.filter(prop => prop.Record.status === 'PENDING');
    }, [proposals]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Consensus & Voting</h1>
                <p className="text-muted-foreground">
                    Review pending treasury proposals and cast your organization's vote to reach network consensus.
                </p>
            </div>

            <GlassCard className="p-6">
                <SectionTitle className="text-lg mb-6 flex items-center gap-2">
                    <Hammer className="h-5 w-5 text-primary" />
                    Proposals Awaiting Approval
                </SectionTitle>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Current Votes</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && pendingProposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading proposals...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : pendingProposals.length > 0 ? (
                                pendingProposals.map((prop) => (
                                    <TableRow key={prop.Key} className="group">
                                        <TableCell className="font-medium text-white">{prop.Key}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-sm truncate" title={prop.Record.purpose}>
                                            {prop.Record.purpose}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">{formatCurrency(prop.Record.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                {prop.Record.votes} Approvals
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="primary" 
                                                size="sm" 
                                                onClick={() => navigate(`/dashboard/voting/${prop.Key}`)}
                                                className="gap-2"
                                            >
                                                Review & Vote <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <div className="p-4 bg-white/5 rounded-full mb-3">
                                                <Hammer className="h-8 w-8 opacity-40" />
                                            </div>
                                            <p className="text-lg font-medium text-white mb-1">No Pending Proposals</p>
                                            <p className="text-sm">There are currently no proposals requiring consensus.</p>
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
