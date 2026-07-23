import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Stack } from '../../components/layout/Stack';
import { ArrowLeft, Loader2, XCircle, Clock, CheckCircle2, FileText, Check, Hammer, Activity } from 'lucide-react';

export function HistoryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProposalHistory, isLoading } = useTreasuryApi();
    
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchHistory() {
            const data = await getProposalHistory(id);
            if (isMounted) {
                if (data && data.length > 0) {
                    setHistory(data);
                } else {
                    setError(true);
                }
            }
        }
        
        fetchHistory();
        
        return () => { isMounted = false; };
    }, [id, getProposalHistory]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatTimestamp = (timestampObj) => {
        if (!timestampObj) return 'N/A';
        // Fabric timestamp is { seconds, nanos }
        const ms = (timestampObj.seconds * 1000) + Math.floor(timestampObj.nanos / 1000000);
        return new Date(ms).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    if (isLoading && history.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Parsing historical ledger...</BodyText>
                </Stack>
            </div>
        );
    }

    if (error || (!isLoading && history.length === 0)) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <GlassCard className="p-8 text-center max-w-md border-dashed">
                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-4 opacity-50" />
                    <SectionTitle className="text-xl mb-2">History Not Found</SectionTitle>
                    <p className="text-muted-foreground text-sm mb-6">
                        No historical records found for Proposal {id}.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard/history')}>
                        Back to History
                    </Button>
                </GlassCard>
            </div>
        );
    }

    // Sort history chronologically
    const sortedHistory = [...history].sort((a, b) => {
        const timeA = (a.timestamp.seconds * 1000) + (a.timestamp.nanos / 1000000);
        const timeB = (b.timestamp.seconds * 1000) + (b.timestamp.nanos / 1000000);
        return timeA - timeB;
    });

    const currentState = sortedHistory[sortedHistory.length - 1].state;

    // Build timeline events
    const timelineEvents = [];

    // 1. Creation event
    const creationState = sortedHistory[0];
    timelineEvents.push({
        id: 'creation',
        icon: FileText,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        title: 'Proposal Created',
        desc: `Submitted by FinanceMSP (assumed) for ${formatCurrency(creationState.state.amount)}.`,
        time: formatTimestamp(creationState.timestamp)
    });

    // 2. Voting events (delta analysis)
    let previousVotes = 0;
    sortedHistory.forEach(record => {
        const state = record.state;
        if (state.votes > previousVotes) {
            // Find which org voted
            const voteDetails = state.voteDetails || {};
            const orgs = Object.keys(voteDetails);
            
            orgs.forEach(org => {
                // If it's a new vote in this state change
                timelineEvents.push({
                    id: `vote_${record.txId}_${org}`,
                    icon: Hammer,
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500/10',
                    title: `Vote Cast: ${voteDetails[org].vote}`,
                    desc: `${org} cast their consensus vote.`,
                    time: formatTimestamp(record.timestamp)
                });
            });
            previousVotes = state.votes;
        }
    });

    // 3. Final State Event
    if (currentState.status === 'APPROVED') {
        const approvedRecord = sortedHistory.find(r => r.state.status === 'APPROVED');
        timelineEvents.push({
            id: 'approved',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            title: 'Consensus Reached: APPROVED',
            desc: `Required threshold met. Funds logically disbursed from Treasury Reserve.`,
            time: approvedRecord ? formatTimestamp(approvedRecord.timestamp) : 'N/A'
        });
    } else if (currentState.status === 'REJECTED') {
        const rejectedRecord = sortedHistory.find(r => r.state.status === 'REJECTED');
        timelineEvents.push({
            id: 'rejected',
            icon: XCircle,
            color: 'text-destructive',
            bgColor: 'bg-destructive/10',
            title: 'Proposal REJECTED',
            desc: `Proposal failed to reach consensus.`,
            time: rejectedRecord ? formatTimestamp(rejectedRecord.timestamp) : 'N/A'
        });
    } else {
        timelineEvents.push({
            id: 'pending',
            icon: Clock,
            color: 'text-muted-foreground',
            bgColor: 'bg-white/5',
            title: 'Awaiting Consensus',
            desc: `Proposal is currently active and awaiting further organizational votes.`,
            time: 'Ongoing'
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <Button 
                    variant="link" 
                    onClick={() => navigate('/dashboard/history')}
                    className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to History
                </Button>
                <h1 className="text-3xl font-bold text-white mb-1">Lifecycle Timeline: {id}</h1>
                <p className="text-muted-foreground text-sm">
                    Cryptographic reconstruction of all state transitions recorded on the distributed ledger.
                </p>
            </div>

            {/* Proposal Summary Card */}
            <GlassCard className="p-6 border-l-4 border-l-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity className="h-32 w-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Purpose</span>
                        <h2 className="text-xl font-bold text-white mb-2">{currentState.purpose}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Req: <strong className="text-white font-medium">{formatCurrency(currentState.amount)}</strong></span>
                            <span>•</span>
                            <span>Votes: <strong className="text-white font-medium">{currentState.votes}</strong></span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Final Status</span>
                        <Badge 
                            variant={currentState.status === 'APPROVED' ? 'success' : currentState.status === 'REJECTED' ? 'destructive' : 'warning'} 
                            className="text-sm px-3 py-1"
                        >
                            {currentState.status}
                        </Badge>
                    </div>
                </div>
            </GlassCard>

            {/* Vertical Timeline */}
            <GlassCard className="p-8">
                <SectionTitle className="text-lg mb-8">Event Trajectory</SectionTitle>
                
                <div className="relative pl-8 space-y-10 border-l border-white/10 ml-4 py-2">
                    {timelineEvents.map((event, index) => {
                        const Icon = event.icon;
                        const isLast = index === timelineEvents.length - 1;
                        
                        return (
                            <div key={event.id} className="relative group">
                                {/* Timeline Node */}
                                <div className={`absolute -left-[45px] w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#09090b] ${event.bgColor} ${event.color} transition-transform group-hover:scale-110 z-10`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                
                                {/* Content */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-5 transition-colors group-hover:bg-white/10 group-hover:border-white/20">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                        <h3 className={`font-semibold ${event.color}`}>{event.title}</h3>
                                        <span className="text-xs text-muted-foreground font-mono bg-black/40 px-2 py-1 rounded">
                                            {event.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {event.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
