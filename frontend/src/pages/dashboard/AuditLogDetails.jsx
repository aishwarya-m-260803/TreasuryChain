import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { ArrowLeft, Loader2, XCircle, ShieldCheck, ArrowUpRight, Database, Hash, FileJson, Clock } from 'lucide-react';

export function AuditLogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAuditLogs, getNetworkConfig, isLoading } = useTreasuryApi();
    
    const [auditLog, setAuditLog] = useState(null);
    const [networkConfig, setNetworkConfig] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchAuditDetails() {
            const [logsList, config] = await Promise.all([
                getAuditLogs(),
                getNetworkConfig()
            ]);
            if (isMounted) {
                if (config) setNetworkConfig(config);
                if (logsList) {
                    const found = logsList.find(l => l.Key === id);
                    if (found) {
                        setAuditLog(found);
                    } else {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            }
        }
        
        fetchAuditDetails();
        
        return () => { isMounted = false; };
    }, [id, getAuditLogs, getNetworkConfig]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
        });
    };

    if (isLoading && !auditLog) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Retrieving cryptographic record...</BodyText>
                </Stack>
            </div>
        );
    }

    if (error || (!isLoading && !auditLog)) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <GlassCard className="p-8 text-center max-w-md border-dashed">
                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-4 opacity-50" />
                    <SectionTitle className="text-xl mb-2">Record Not Found</SectionTitle>
                    <p className="text-muted-foreground text-sm mb-6">
                        The requested transaction ID could not be located on the ledger.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard/audit')}>
                        Back to Audit Logs
                    </Button>
                </GlassCard>
            </div>
        );
    }

    const { Record } = auditLog;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/dashboard/audit')}
                        className="px-0 text-muted-foreground hover:text-white mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Audit Logs
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white flex-1 truncate">Event {Record.eventId?.substring(0, 16)}...</h1>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 uppercase tracking-wider px-2 py-0.5 ml-2">
                            Verified
                        </Badge>
                    </div>
                </div>
            </div>

            <Grid columns={3} gap="lg">
                {/* Main Details */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <SectionTitle className="text-xl mb-6">Transaction Details</SectionTitle>
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Action</h3>
                                <div className="text-xl font-bold text-primary font-mono tracking-wide">
                                    {Record.eventType}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message Payload</h3>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm leading-relaxed">
                                    {Record.details}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" /> Origin Organization
                                    </h3>
                                    <p className="text-white text-lg font-medium">
                                        {Record.organization}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" /> Network Timestamp
                                    </h3>
                                    <p className="text-white">
                                        {formatDate(Record.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Blockchain Metadata (Placeholder for future Fabric specific details) */}
                    <GlassCard className="p-8 border-dashed border-white/10">
                        <SectionTitle className="text-xl mb-6 flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            Ledger Metadata
                        </SectionTitle>
                        
                        <div className="grid gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-muted-foreground w-32 shrink-0">Transaction ID</span>
                                <span className="text-sm font-mono text-white truncate text-right">{Record.transactionId}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-muted-foreground w-32 shrink-0">Channel</span>
                                <span className="text-sm font-mono text-white text-right">{networkConfig?.channelName || 'Not Available'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-muted-foreground w-32 shrink-0">Chaincode</span>
                                <span className="text-sm font-mono text-white text-right">{networkConfig?.chaincodeName || 'Not Available'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground w-32 shrink-0 flex items-center gap-2">
                                    <FileJson className="h-4 w-4" /> Raw State
                                </span>
                                <pre className="text-xs font-mono text-muted-foreground text-right max-w-[280px] overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(Record, null, 2)}</pre>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    {Record.proposalId && (
                        <GlassCard className="p-6">
                            <SectionTitle className="text-lg mb-6">Related Context</SectionTitle>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Target Proposal</span>
                                    <div className="text-lg font-bold text-white mb-3">
                                        {Record.proposalId}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full gap-2 border-primary/20 hover:bg-primary/10"
                                        onClick={() => navigate(`/dashboard/proposals/${Record.proposalId}`)}
                                    >
                                        View Proposal <ArrowUpRight className="h-3 w-3" />
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
