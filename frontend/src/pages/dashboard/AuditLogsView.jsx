import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Grid } from '../../components/layout/Grid';
import { Search, Filter, Loader2, ArrowRight, ShieldCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';

export function AuditLogsView() {
    const { getAuditLogs, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [auditLogs, setAuditLogs] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
    const [dateSort, setDateSort] = useState('NEWEST');

    useEffect(() => {
        let isMounted = true;
        
        async function fetchAuditLogs() {
            const data = await getAuditLogs();
            if (isMounted && data) {
                setAuditLogs(data);
            }
        }
        
        fetchAuditLogs();
        
        return () => { isMounted = false; };
    }, [getAuditLogs]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Derived summary stats
    const todayLogsCount = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return auditLogs.filter(log => new Date(log.Record.timestamp).toLocaleDateString() === today).length;
    }, [auditLogs]);
    
    const proposalEventsCount = useMemo(() => {
        return auditLogs.filter(log => log.Record.eventType?.includes('PROPOSAL')).length;
    }, [auditLogs]);
    
    const votingEventsCount = useMemo(() => {
        return auditLogs.filter(log => log.Record.eventType?.includes('VOTE')).length;
    }, [auditLogs]);

    // Filter logic
    const filteredLogs = useMemo(() => {
        let filtered = auditLogs.filter(log => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
                log.Record.transactionId?.toLowerCase().includes(searchLower) ||
                log.Record.organization?.toLowerCase().includes(searchLower) ||
                log.Record.proposalId?.toLowerCase().includes(searchLower);
            
            const matchesEvent = eventTypeFilter === 'ALL' || log.Record.eventType?.includes(eventTypeFilter);
            
            return matchesSearch && matchesEvent;
        });

        if (dateSort === 'NEWEST') {
            filtered.sort((a, b) => new Date(b.Record.timestamp) - new Date(a.Record.timestamp));
        } else {
            filtered.sort((a, b) => new Date(a.Record.timestamp) - new Date(b.Record.timestamp));
        }

        return filtered;
    }, [auditLogs, searchQuery, eventTypeFilter, dateSort]);

    const getEventBadge = (eventType) => {
        if (!eventType) return <Badge variant="secondary">Unknown</Badge>;
        
        if (eventType.includes('PROPOSAL_CREATED')) return <Badge variant="success">Proposal Created</Badge>;
        if (eventType.includes('VOTE_CAST')) return <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">Vote Cast</Badge>;
        if (eventType.includes('EXPENSE')) return <Badge variant="destructive">Expense</Badge>;
        
        return <Badge variant="secondary">{eventType}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Immutable Audit Logs</h1>
                <p className="text-muted-foreground">
                    Verifiable, cryptographic trail of all actions and state changes on the Treasury network.
                </p>
            </div>

            {/* Summary Cards */}
            <Grid columns={4} gap="md" className="auto-rows-fr mb-8">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {auditLogs.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Audit Records</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Clock className="h-5 w-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {todayLogsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Today's Activities</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {proposalEventsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Proposal Events</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {votingEventsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Voting Events</p>
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
                            placeholder="Search by Tx ID, Organization, or Proposal ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={eventTypeFilter}
                            onChange={(e) => setEventTypeFilter(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-md text-sm text-white py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        >
                            <option value="ALL">All Event Types</option>
                            <option value="PROPOSAL">Proposal Events</option>
                            <option value="VOTE">Voting Events</option>
                            <option value="EXPENSE">Expense Events</option>
                        </select>
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
                                <TableHead>Tx ID</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Proposal ID</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && auditLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading immutable ledger...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.Key} className="group">
                                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[80px]" title={log.Record.transactionId}>
                                            {log.Record.transactionId?.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            {getEventBadge(log.Record.eventType)}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {log.Record.organization?.replace('MSP', '')}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                            {log.Record.proposalId || '---'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(log.Record.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Verified</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => navigate(`/dashboard/audit/${log.Key}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                            >
                                                Inspect <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <ShieldCheck className="h-8 w-8 mb-3 opacity-20" />
                                            <p className="text-white font-medium mb-1">No Audit Records Found</p>
                                            <p className="text-sm">Adjust your filters or query parameters.</p>
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
