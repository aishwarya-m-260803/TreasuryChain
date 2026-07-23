import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { ConfirmVoteModal } from './components/ConfirmVoteModal';
import { ArrowLeft, Loader2, XCircle, Hammer, Check, X } from 'lucide-react';

export function VotingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getProposalById, voteOnProposal, isLoading } = useTreasuryApi();
    
    const [proposal, setProposal] = useState(null);
    const [error, setError] = useState(false);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null); // 'APPROVE' or 'REJECT'
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProposal = async () => {
        const data = await getProposalById(id);
        if (data) {
            setProposal(data);
        } else {
            setError(true);
        }
    };

    useEffect(() => {
        fetchProposal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleVoteClick = (type) => {
        setSelectedVote(type);
        setModalOpen(true);
    };

    const handleConfirmVote = async () => {
        setIsSubmitting(true);
        const success = await voteOnProposal(id, selectedVote);
        if (success) {
            setModalOpen(false);
            // Refresh proposal to show updated status
            await fetchProposal();
        }
        setIsSubmitting(false);
    };

    if (isLoading && !proposal && !isSubmitting) {
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
                        The proposal {id} could not be found.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard/voting')}>
                        Back to Voting
                    </Button>
                </GlassCard>
            </div>
        );
    }

    // Determine if the current user's organization has already voted
    const hasVoted = proposal.votedOrgs?.includes(user.mspId);
    
    // Determine if proposal is still pending
    const isPending = proposal.status === 'PENDING';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <Button 
                    variant="link" 
                    onClick={() => navigate('/dashboard/voting')}
                    className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Pending Proposals
                </Button>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Review {proposal.proposalId}
                    </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Review the details below carefully before casting your organization's immutable vote.
                </p>
            </div>

            <Grid columns={3} gap="lg">
                {/* Main Details */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requested Purpose</h3>
                                <p className="text-lg text-white leading-relaxed">
                                    {proposal.purpose}
                                </p>
                            </div>
                            
                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requested Amount</h3>
                                <p className="text-3xl font-bold text-primary">
                                    {formatCurrency(proposal.amount)}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Voting Action Panel */}
                    <GlassCard className="p-8 border-primary/20 relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        
                        <SectionTitle className="text-xl mb-6 flex items-center gap-2 relative z-10">
                            <Hammer className="h-5 w-5 text-primary" />
                            Cast Your Vote
                        </SectionTitle>

                        <div className="relative z-10">
                            {!isPending ? (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                                    <p className="text-white font-medium mb-1">Voting Closed</p>
                                    <p className="text-sm text-muted-foreground">This proposal has already reached a final state ({proposal.status}).</p>
                                </div>
                            ) : hasVoted ? (
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-3 text-primary">
                                    <Check className="h-5 w-5" />
                                    <span className="font-medium">Vote Submitted by {user.organization}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                    <Button 
                                        variant="success" 
                                        className="flex-1 py-6 text-lg gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all"
                                        onClick={() => handleVoteClick('APPROVE')}
                                    >
                                        <Check className="h-6 w-6" />
                                        Approve
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        className="flex-1 py-6 text-lg gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all"
                                        onClick={() => handleVoteClick('REJECT')}
                                    >
                                        <X className="h-6 w-6" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <SectionTitle className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Current Progress</SectionTitle>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white">Approvals</span>
                                <span className="text-xl font-bold text-emerald-400">{proposal.votes}</span>
                            </div>
                            
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-3">Voted Organizations</span>
                                {proposal.votedOrgs && proposal.votedOrgs.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {proposal.votedOrgs.map(org => (
                                            <div key={org} className="flex items-center gap-2 text-sm text-white bg-white/5 p-2 rounded-md border border-white/5">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span className="truncate">{org}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No votes have been cast on this proposal yet.</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </Grid>

            {/* Confirmation Modal */}
            <ConfirmVoteModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmVote}
                voteType={selectedVote}
                isLoading={isSubmitting}
            />
        </div>
    );
}
