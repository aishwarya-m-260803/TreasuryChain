import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { ConfirmVoteModal } from './components/ConfirmVoteModal';
import { ArrowLeft, Loader2, XCircle, Hammer, Check, X, CheckCircle2, Clock } from 'lucide-react';

export function VotingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isFunding = searchParams.get('type') === 'funding';
    
    const { user } = useAuth();
    const { getProposalById, voteOnProposal, getFundingProposalById, voteOnFundingProposal, isLoading } = useTreasuryApi();
    
    const [proposal, setProposal] = useState(null);
    const [error, setError] = useState(false);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null); // 'APPROVE' or 'REJECT'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteSuccess, setVoteSuccess] = useState(null);
    const [voteError, setVoteError] = useState(null);

    const fetchProposal = async () => {
        const data = isFunding ? await getFundingProposalById(id) : await getProposalById(id);
        if (data) {
            setProposal(data);
        } else {
            setError(true);
        }
    };

    useEffect(() => {
        fetchProposal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isFunding]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleVoteClick = (type) => {
        setVoteError(null);
        setSelectedVote(type);
        setModalOpen(true);
    };

    const handleConfirmVote = async () => {
        setIsSubmitting(true);
        setVoteError(null);
        setVoteSuccess(null);

        const success = isFunding 
            ? await voteOnFundingProposal(id, selectedVote) 
            : await voteOnProposal(id, selectedVote);
            
        if (success) {
            setModalOpen(false);
            const actionText = selectedVote === 'APPROVE' ? 'approval' : 'rejection';
            setVoteSuccess(`Your ${actionText} has been recorded successfully.`);
            
            // Refresh proposal to show updated status immediately
            await fetchProposal();
            
            // Wait 2.5 seconds, then redirect
            setTimeout(() => {
                navigate(isFunding ? '/dashboard/funding' : '/dashboard/voting');
            }, 2500);
        } else {
            setModalOpen(false);
            setVoteError('Failed to record your vote. Please try again.');
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
                    <Button variant="outline" onClick={() => navigate(isFunding ? '/dashboard/funding' : '/dashboard/voting')}>
                        Back to {isFunding ? 'Funding' : 'Voting'}
                    </Button>
                </GlassCard>
            </div>
        );
    }

    // Determine if the current user's organization has already voted
    const hasVoted = proposal.votedOrgs?.includes(user.mspId);
    
    // Determine if proposal is still pending
    const isPending = proposal.status?.toUpperCase() === 'PENDING';

    const parseProposalPurpose = (purposeStr) => {
        if (!purposeStr) return {
            isStructured: false,
            title: 'Proposal Request',
            category: 'N/A',
            priority: 'Medium',
            requiredByDate: 'N/A',
            submittedBy: 'N/A',
            organization: 'N/A',
            submissionDate: 'N/A',
            description: 'N/A',
            businessImpact: 'N/A'
        };

        const headerRegex = /^\[([^|]+)\s*\|\s*([^\]]+)\]\s*(.+)$/m;
        const headerMatch = purposeStr.match(headerRegex);

        if (headerMatch) {
            const category = headerMatch[1].trim();
            const priority = headerMatch[2].trim().replace(/\s+Priority$/, '');
            const title = headerMatch[3].trim();

            const requiredByMatch = purposeStr.match(/Required By:\s*([^\n]+)/);
            const submittedByMatch = purposeStr.match(/Submitted By:\s*([^\(]+)\s*\(([^)]+)\)\s*on\s*([^\n]+)/);
            
            let description = '';
            let businessImpact = '';

            const descIndex = purposeStr.indexOf('DESCRIPTION:');
            const impactIndex = purposeStr.indexOf('EXPECTED BUSINESS IMPACT:');

            if (descIndex !== -1) {
                const descEnd = impactIndex !== -1 ? impactIndex : purposeStr.length;
                description = purposeStr.substring(descIndex + 'DESCRIPTION:'.length, descEnd).trim();
            }

            if (impactIndex !== -1) {
                businessImpact = purposeStr.substring(impactIndex + 'EXPECTED BUSINESS IMPACT:'.length).trim();
            }

            return {
                isStructured: true,
                title,
                category,
                priority,
                requiredByDate: requiredByMatch ? requiredByMatch[1].trim() : 'N/A',
                submittedBy: submittedByMatch ? submittedByMatch[1].trim() : 'N/A',
                organization: submittedByMatch ? submittedByMatch[2].trim() : 'N/A',
                submissionDate: submittedByMatch ? submittedByMatch[3].trim() : 'N/A',
                description: description || 'N/A',
                businessImpact: businessImpact || 'N/A'
            };
        }

        return {
            isStructured: false,
            title: 'Proposal Request',
            category: 'N/A',
            priority: 'Medium',
            requiredByDate: 'N/A',
            submittedBy: 'N/A',
            organization: 'N/A',
            submissionDate: 'N/A',
            description: purposeStr,
            businessImpact: 'N/A'
        };
    };

    const formatOrgName = (org) => {
        if (!org || org === 'N/A') return 'N/A';
        return org.charAt(0).toUpperCase() + org.slice(1);
    };

    const details = isFunding ? {
        isStructured: true,
        title: proposal.reason || 'Funding Proposal',
        category: proposal.source || 'N/A',
        priority: 'Medium',
        requiredByDate: 'N/A',
        submittedBy: proposal.organization ? formatOrgName(proposal.organization) : 'N/A',
        organization: proposal.organization || 'N/A',
        submissionDate: proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A',
        description: proposal.description || 'N/A',
        businessImpact: 'Funding reference: ' + (proposal.referenceNumber || 'N/A')
    } : parseProposalPurpose(proposal.purpose);

    const ALL_MSPS = ['FinanceMSP', 'TrusteeMSP', 'OperationsMSP', 'AuditMSP'];
    const votedList = proposal.votedOrgs || [];
    const pendingList = ALL_MSPS.filter(msp => !votedList.includes(msp));
    
    const displayId = isFunding ? proposal.id : proposal.proposalId;
    const requestType = isFunding ? 'Funding Request' : 'Funding Request'; // Kept as original style

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <Button 
                    variant="link" 
                    onClick={() => navigate(isFunding ? '/dashboard/funding' : '/dashboard/voting')}
                    className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Pending {isFunding ? 'Funding Proposals' : 'Proposals'}
                </Button>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Review {displayId}
                    </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Review the {isFunding ? 'funding' : 'structured funding'} request document carefully before casting your organization's immutable vote.
                </p>
            </div>

            <Grid columns={3} gap="lg">
                {/* Main Details Sheet */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    {/* Document Header & Metadata */}
                    <GlassCard className="p-8 space-y-8">
                        <div>
                            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                {isFunding ? 'Funding Details Metadata' : 'Funding Request Metadata'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Proposal ID</span>
                                    <span className="text-white font-medium text-sm">{displayId}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Proposal Title</span>
                                    <span className="text-white font-medium text-sm">{details.title}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Organization</span>
                                    <span className="text-white font-medium text-sm">{formatOrgName(details.organization)}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Submitted By</span>
                                    <span className="text-white font-medium text-sm">{details.submittedBy}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Submission Date</span>
                                    <span className="text-white font-medium text-sm">{details.submissionDate}</span>
                                </div>
                                {!isFunding && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Required By Date</span>
                                        <span className="text-white font-medium text-sm">{details.requiredByDate}</span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">{isFunding ? 'Source' : 'Category'}</span>
                                    <span className="text-white font-medium text-sm">{details.category}</span>
                                </div>
                                {!isFunding && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Priority</span>
                                        <div>
                                            <Badge 
                                                variant={
                                                    details.priority === 'Critical' || details.priority === 'High' 
                                                        ? 'destructive' 
                                                        : details.priority === 'Medium' 
                                                            ? 'warning' 
                                                            : 'secondary'
                                                }
                                            >
                                                {details.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Financial Details Card */}
                    <GlassCard className="p-8 border-l-4 border-l-primary bg-primary/[0.02]">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Requested Amount</span>
                            <span className="text-4xl font-black text-primary tracking-tight">
                                {formatCurrency(proposal.amount)}
                            </span>
                        </div>
                    </GlassCard>

                    {/* Purpose Section */}
                    <GlassCard className="p-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                                {isFunding ? 'Reason & Description' : 'Purpose & Description'}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {details.description}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Business Impact Section */}
                    <GlassCard className="p-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                                {isFunding ? 'Additional Context' : 'Expected Business Impact'}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {details.businessImpact}
                            </p>
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
                            {voteSuccess ? (
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-lg flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300">
                                    <div className="p-2 bg-emerald-500/20 rounded-full animate-bounce">
                                        <Check className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base mb-1">{voteSuccess}</p>
                                        <p className="text-xs text-muted-foreground">Redirecting to pending proposals...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {voteError && (
                                        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                                            <div className="text-sm font-medium">{voteError}</div>
                                        </div>
                                    )}

                                    {proposal.status?.toUpperCase() === 'EXPIRED' ? (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                                            <p className="text-white font-medium mb-1">Voting Deadline Passed</p>
                                            <p className="text-sm text-muted-foreground">This proposal has expired based on its Required By Date and is no longer eligible for voting.</p>
                                        </div>
                                    ) : !isPending ? (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                                            <p className="text-white font-medium mb-1">Voting Closed</p>
                                            <p className="text-sm text-muted-foreground">This proposal has already reached a final state ({proposal.status}).</p>
                                        </div>
                                    ) : hasVoted ? (
                                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-3 text-primary">
                                            <Check className="h-5 w-5" />
                                            <span className="font-medium">Vote Submitted by {formatOrgName(user.organization)}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mt-2">
                                            {user?.role !== 'admin' && (
                                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-xs flex items-center justify-center gap-2 font-medium">
                                                    <XCircle className="h-4 w-4 shrink-0 text-amber-400" />
                                                    <span>Voting is restricted to Admin accounts (Admin Only).</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <Button 
                                                    variant="success" 
                                                    className="flex-1 py-6 text-lg gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    onClick={() => handleVoteClick('APPROVE')}
                                                    disabled={isSubmitting || isLoading || user?.role !== 'admin'}
                                                    title={user?.role !== 'admin' ? "Admin Only: User role cannot vote" : ""}
                                                >
                                                    {isSubmitting && selectedVote === 'APPROVE' ? (
                                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                    ) : (
                                                        <Check className="h-6 w-6" />
                                                    )}
                                                    Approve {user?.role !== 'admin' && '(Admin Only)'}
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    className="flex-1 py-6 text-lg gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    onClick={() => handleVoteClick('REJECT')}
                                                    disabled={isSubmitting || isLoading || user?.role !== 'admin'}
                                                    title={user?.role !== 'admin' ? "Admin Only: User role cannot vote" : ""}
                                                >
                                                    {isSubmitting && selectedVote === 'REJECT' ? (
                                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                    ) : (
                                                        <X className="h-6 w-6" />
                                                    )}
                                                    Reject {user?.role !== 'admin' && '(Admin Only)'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Enhanced Sidebar Progress Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    <GlassCard className="p-6 space-y-6">
                        <div>
                            <SectionTitle className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Proposal Status</SectionTitle>
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant={
                                        proposal.status?.toUpperCase() === 'APPROVED' 
                                            ? 'success' 
                                            : proposal.status?.toUpperCase() === 'REJECTED' 
                                                ? 'destructive' 
                                                : proposal.status?.toUpperCase() === 'EXPIRED'
                                                    ? 'secondary'
                                                    : 'warning'
                                    } 
                                    className="text-xs uppercase tracking-wider px-2 py-0.5"
                                >
                                    {proposal.status}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <SectionTitle className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Approval Progress</SectionTitle>
                            <div className="flex items-end justify-between mb-1.5">
                                <span className="text-xs text-muted-foreground">Consensus Level</span>
                                <span className="text-sm font-bold text-white">{proposal.votes} / 4 Approvals</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(proposal.votes / 4) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Voted Organizations</span>
                                {votedList.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {votedList.map(org => (
                                            <div key={org} className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 p-2 rounded-md border border-emerald-500/10">
                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate font-medium">{org.replace('MSP', '')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No votes cast yet.</p>
                                )}
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Pending Action</span>
                                {pendingList.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {pendingList.map(org => (
                                            <div key={org} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 p-2 rounded-md border border-amber-500/10">
                                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate font-medium">{org.replace('MSP', '')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">All organizations have voted.</p>
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
