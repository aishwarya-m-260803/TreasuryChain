import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FileText, Search, Plus, Filter, Loader2, Check, X } from 'lucide-react';
import { CreateFundingModal } from './components/CreateFundingModal';

export function FundingView() {
    const { user } = useAuth();
    const { getFundingProposals, voteOnFundingProposal, confirmFundingProposal, isLoading } = useTreasuryApi();
    const navigate = useNavigate();
    
    const [proposals, setProposals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchProposals = async () => {
        const data = await getFundingProposals();
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
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'destructive';
            case 'CONFIRMED': return 'primary';
            default: return 'secondary';
        }
    };

    // Filter logic
    const filteredProposals = useMemo(() => {
        return proposals.filter(prop => {
            const matchesSearch = 
                prop.Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prop.Record.organization.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'ALL' || prop.Record.status.toUpperCase() === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [proposals, searchQuery, statusFilter]);

    const handleVote = async (id, vote) => {
        if (!window.confirm(`Are you sure you want to ${vote} this funding proposal?`)) return;
        const success = await voteOnFundingProposal(id, vote);
        if (success) fetchProposals();
    };

    const handleConfirm = async (id) => {
        if (!window.confirm('Are you sure you want to confirm this funding proposal and add to reserve?')) return;
        const success = await confirmFundingProposal(id);
        if (success) fetchProposals();
    };

    // Finance Admin check (user.organization 'finance' or role 'admin' representing Finance Admin depending on your structure)
    // The requirement says "Only Finance Admin can confirm". Let's assume user.organization === 'finance' && user.role === 'admin'
    // Let's use simple logic: user.organization?.toLowerCase() === 'finance' && user.role === 'admin'
    const isFinanceAdmin = user?.organization?.toLowerCase() === 'finance' && user?.role === 'admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Funding</h1>
                    <p className="text-muted-foreground">Manage and track treasury funding proposals.</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => setIsModalOpen(true)} 
                    disabled={user?.role !== 'admin'} 
                    className="gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={user?.role !== 'admin' ? 'Admin Only' : ''}
                >
                    <Plus className="h-4 w-4" />
                    Create Funding {user?.role !== 'admin' && '(Admin Only)'}
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
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CONFIRMED">Confirmed</option>
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
                                <TableHead>Votes</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && proposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
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
                                        <TableCell className="text-white">{formatCurrency(prop.Record.amount)}</TableCell>
                                        <TableCell className="text-muted-foreground">{prop.Record.organization}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(prop.Record.status)}>
                                                {prop.Record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{prop.Record.votes}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(prop.Record.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {prop.Record.status.toUpperCase() === 'PENDING' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="primary" 
                                                        onClick={() => navigate(`/dashboard/voting/${prop.Key}?type=funding`)}
                                                    >
                                                        Review & Vote
                                                    </Button>
                                                )}
                                                {prop.Record.status.toUpperCase() === 'APPROVED' && isFinanceAdmin && (
                                                    <Button size="sm" variant="primary" onClick={() => handleConfirm(prop.Key)} title="Confirm Funding">
                                                        Confirm
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <FileText className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No funding proposals found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            <CreateFundingModal 
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
