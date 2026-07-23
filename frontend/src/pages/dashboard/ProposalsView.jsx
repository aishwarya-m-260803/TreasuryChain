import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import { FileText, Search, Plus, Filter, Loader2, ArrowRight } from 'lucide-react';
import { CreateProposalModal } from './components/CreateProposalModal';

export function ProposalsView() {
    const { getProposals, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [proposals, setProposals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchProposals = async () => {
        const data = await getProposals();
        if (data) {
            setProposals(data);
        }
    };

    useEffect(() => {
        fetchProposals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Proposals</h1>
                    <p className="text-muted-foreground">Manage and track treasury funding requests.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Create Proposal
                </Button>
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
                            placeholder="Search by ID or Purpose..."
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
                                <TableHead>Purpose</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Votes</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && proposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                                            <span>Loading proposals...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProposals.length > 0 ? (
                                filteredProposals.map((prop) => (
                                    <TableRow key={prop.Key} className="group">
                                        <TableCell className="font-medium text-white">{prop.Key}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate" title={prop.Record.purpose}>
                                            {prop.Record.purpose}
                                        </TableCell>
                                        <TableCell className="text-white">{formatCurrency(prop.Record.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(prop.Record.status)}>
                                                {prop.Record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{prop.Record.votes}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => navigate(`/dashboard/proposals/${prop.Key}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                            >
                                                Details <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <FileText className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No proposals found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            <CreateProposalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchProposals();
                }} 
            />
        </div>
    );
}
