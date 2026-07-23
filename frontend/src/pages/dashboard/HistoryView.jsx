import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Search, Filter, Loader2, ArrowRight, History } from 'lucide-react';

export function HistoryView() {
    const { getProposals, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [proposals, setProposals] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };

    // Filter logic
    const filteredProposals = useMemo(() => {
        return proposals.filter(prop => {
            const matchesSearch = 
                prop.Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prop.Record.purpose.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || prop.Record.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [proposals, searchQuery, statusFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Proposal History</h1>
                <p className="text-muted-foreground">
                    Track the complete lifecycle and chronological state transitions of all treasury proposals.
                </p>
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
                            placeholder="Search by ID or Title..."
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
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
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
                                <TableHead>Title</TableHead>
                                <TableHead>Requested Amount</TableHead>
                                <TableHead>Final Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && proposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading history ledger...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProposals.length > 0 ? (
                                filteredProposals.map((prop) => (
                                    <TableRow key={prop.Key} className="group">
                                        <TableCell className="font-medium text-white">{prop.Key}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-sm truncate" title={prop.Record.purpose}>
                                            {prop.Record.purpose}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">{formatCurrency(prop.Record.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(prop.Record.status)}>
                                                {prop.Record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => navigate(`/dashboard/history/${prop.Key}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                                            >
                                                Timeline <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <History className="h-8 w-8 mb-3 opacity-20" />
                                            <p className="text-white font-medium mb-1">No Records Found</p>
                                            <p className="text-sm">No proposals match your search or filter criteria.</p>
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
