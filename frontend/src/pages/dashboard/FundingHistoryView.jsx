import React, { useEffect, useState, useMemo } from 'react';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Loader2, FileText } from 'lucide-react';

export function FundingHistoryView() {
    const { getFundingProposals, isLoading } = useTreasuryApi();
    const [proposals, setProposals] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        let isMounted = true;
        const fetchHistory = async () => {
            const data = await getFundingProposals();
            if (data && isMounted) {
                // Filter only finalized proposals (Confirmed or Rejected) for history view
                const historyData = data.filter(p => 
                    p.Record.status === 'Confirmed' || p.Record.status === 'Rejected'
                );
                setProposals(historyData);
            }
        };
        fetchHistory();
        return () => { isMounted = false; };
    }, [getFundingProposals]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'REJECTED': return 'destructive';
            case 'CONFIRMED': return 'primary';
            default: return 'secondary';
        }
    };

    const filteredProposals = useMemo(() => {
        return proposals.filter(prop => {
            const matchesSearch = 
                prop.Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prop.Record.organization.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || prop.Record.status.toUpperCase() === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [proposals, searchQuery, statusFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Funding History</h1>
                    <p className="text-muted-foreground">Immutable record of finalized treasury funding proposals.</p>
                </div>
            </div>

            <GlassCard className="p-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by ID or Organization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-md text-sm text-white py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        >
                            <option value="ALL">All Finalized</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Confirmed By</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Confirmed At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && proposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading history...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProposals.length > 0 ? (
                                filteredProposals.map((prop) => (
                                    <TableRow key={prop.Key} className="group">
                                        <TableCell className="font-medium text-white">{prop.Key}</TableCell>
                                        <TableCell className="text-white font-medium">{formatCurrency(prop.Record.amount)}</TableCell>
                                        <TableCell className="text-muted-foreground">{prop.Record.organization}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(prop.Record.status)}>
                                                {prop.Record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{prop.Record.confirmedBy || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(prop.Record.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {prop.Record.confirmedAt ? new Date(prop.Record.confirmedAt).toLocaleDateString() : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <FileText className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No funding history found.</p>
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
