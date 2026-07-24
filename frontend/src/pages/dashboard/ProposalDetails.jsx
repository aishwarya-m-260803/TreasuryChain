import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { ArrowLeft, Loader2, FileText, CheckCircle2, Clock, XCircle, Hammer } from 'lucide-react';

export function ProposalDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProposalById, isLoading } = useTreasuryApi();
    
    const [proposal, setProposal] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchProposal() {
            const data = await getProposalById(id);
            if (isMounted) {
                if (data) {
                    setProposal(data);
                } else {
                    setError(true);
                }
            }
        }
        
        fetchProposal();
        
        return () => { isMounted = false; };
    }, [id, getProposalById]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { color: 'warning', icon: Clock, text: 'Pending Consensus' };
            case 'APPROVED': return { color: 'success', icon: CheckCircle2, text: 'Approved & Executed' };
            case 'REJECTED': return { color: 'destructive', icon: XCircle, text: 'Rejected' };
            default: return { color: 'secondary', icon: FileText, text: status };
        }
    };

    if (isLoading && !proposal) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Loading proposal details...</BodyText>
                </Stack>
            </div>
        );
    }

    if (error || (!isLoading && !proposal)) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <GlassCard className="p-8 text-center max-w-md border-dashed">
                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-4 opacity-50" />
                    <SectionTitle className="text-xl mb-2">Proposal Not Found</SectionTitle>
                    <p className="text-muted-foreground text-sm mb-6">
                        The proposal {id} could not be found on the ledger. It may not exist or you might not have access to it.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard/proposals')}>
                        Back to Proposals
                    </Button>
                </GlassCard>
            </div>
        );
    }

    const statusInfo = getStatusInfo(proposal.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/dashboard/proposals')}
                        className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Proposals
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">Proposal {proposal.proposalId}</h1>
                        <Badge variant={statusInfo.color} className="text-xs uppercase tracking-wider px-2 py-0.5">
                            {proposal.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <Grid columns={3} gap="lg">
                {/* Main Details */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Purpose</h3>
                                <p className="text-lg text-white font-medium leading-relaxed">
                                    {proposal.purpose}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requested Amount</h3>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(proposal.amount)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Status</h3>
                                    <div className="flex items-center gap-2 text-white">
                                        <StatusIcon className={`h-5 w-5 text-${statusInfo.color}`} />
                                        <span className="font-medium">{statusInfo.text}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Voting History */}
                    <GlassCard className="p-8">
                        <SectionTitle className="text-xl mb-6 flex items-center gap-2">
                            <Hammer className="h-5 w-5 text-primary" />
                            Voting History
                        </SectionTitle>

                        {proposal.voteDetails && Object.keys(proposal.voteDetails).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(proposal.voteDetails).map(([org, detail]) => (
                                    <div key={org} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${detail.vote === 'APPROVE' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                                                {detail.vote === 'APPROVE'
                                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    : <XCircle className="h-4 w-4 text-destructive" />
                                                }
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{org.replace('MSP', '')}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {detail.timestamp
                                                        ? new Date(detail.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:text-right">
                                            <Badge variant={detail.vote === 'APPROVE' ? 'success' : 'destructive'}>
                                                {detail.vote}
                                            </Badge>
                                            {detail.txId && (
                                                <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline" title={detail.txId}>
                                                    Tx: {detail.txId.substring(0, 8)}…
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="p-3 bg-white/5 rounded-full mb-4">
                                    <Hammer className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No votes have been cast on this proposal yet.</p>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <SectionTitle className="text-lg mb-4">Consensus Status</SectionTitle>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-sm text-muted-foreground">Total Approvals</span>
                                <span className="text-lg font-bold text-white">{proposal.votes}</span>
                            </div>
                            
                            <div className="pt-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Voted Organizations</span>
                                {proposal.votedOrgs && proposal.votedOrgs.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {proposal.votedOrgs.map(org => (
                                            <Badge key={org} variant="outline" className="bg-white/5">
                                                {org.replace('MSP', '')}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No votes cast yet.</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {proposal.status === 'PENDING' && (
                        <GlassCard className="p-6 bg-primary/5 border-primary/20">
                            <div className="flex items-start gap-3">
                                <Hammer className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-1">Action Required</h4>
                                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                        This proposal requires consensus from participating organizations to be executed.
                                    </p>
                                    <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/dashboard/voting')}>
                                        Proceed to Voting
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </Grid>
        </div>
    );
}
