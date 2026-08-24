import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTreasuryApi } from '../../hooks/useTreasuryApi';
import { GlassCard } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SectionTitle, BodyText } from '../../components/typography/Typography';
import {
    Landmark, FileText, CheckCircle2, Clock, ShieldCheck, Receipt,
    ArrowRight, Loader2, XCircle, TrendingUp, TrendingDown,
    Hammer, AlertTriangle, Activity, Plus, Vote, Eye,
    DollarSign, BarChart3, Heart
} from 'lucide-react';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { Link } from 'react-router-dom';
import { CreateProposalModal } from './components/CreateProposalModal';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

/* ─── Helpers ─── */
const parseProposalPurpose = (purposeStr) => {
    if (!purposeStr) return { title: 'Untitled Proposal', category: 'N/A', priority: 'Medium', requiredByDate: 'N/A' };
    const headerRegex = /^\[([^|]+)\s*\|\s*([^\]]+)\]\s*(.+)$/m;
    const headerMatch = purposeStr.match(headerRegex);
    if (headerMatch) {
        const requiredByMatch = purposeStr.match(/Required By:\s*([^\n]+)/);
        return {
            title: headerMatch[3].trim(),
            category: headerMatch[1].trim(),
            priority: headerMatch[2].trim().replace(/\s+Priority$/, ''),
            requiredByDate: requiredByMatch ? requiredByMatch[1].trim() : 'N/A'
        };
    }
    return { title: purposeStr.substring(0, 60), category: 'N/A', priority: 'Medium', requiredByDate: 'N/A' };
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

const formatOrgName = (org) =>
    org ? org.charAt(0).toUpperCase() + org.slice(1) : '';

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'destructive';
        case 'EXPIRED': return 'secondary';
        default: return 'secondary';
    }
};

const getPriorityColor = (p) => {
    switch (p) {
        case 'Critical': return 'text-red-400';
        case 'High': return 'text-orange-400';
        case 'Medium': return 'text-amber-400';
        case 'Low': return 'text-emerald-400';
        default: return 'text-muted-foreground';
    }
};

const DONUT_COLORS = {
    Pending: '#f59e0b',
    Approved: '#10b981',
    Rejected: '#ef4444',
    Expired: '#6b7280'
};

/* ─── Custom Donut Tooltip ─── */
const DonutTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        const d = payload[0];
        return (
            <div className="bg-slate-900/95 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                <span className="font-semibold text-white">{d.name}</span>
                <span className="text-muted-foreground ml-2">{d.value}</span>
            </div>
        );
    }
    return null;
};

/* ─── Custom Area Tooltip ─── */
const AreaTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-slate-900/95 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                <span className="text-muted-foreground">{label}</span>
                <div className="text-white font-bold mt-0.5">{formatCurrency(payload[0].value)}</div>
            </div>
        );
    }
    return null;
};

/* ─── Main Component ─── */
export function DashboardOverview() {
    const { user } = useAuth();
    const { getSummary, getProposals, getAuditLogs, getExpenses, isLoading } = useTreasuryApi();

    const [summary, setSummary] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        const [summaryData, proposalsData, auditData, expensesData] = await Promise.all([
            getSummary(), getProposals(), getAuditLogs(), getExpenses()
        ]);
        if (summaryData) setSummary(summaryData);
        if (proposalsData) setProposals(proposalsData);
        if (auditData) setAuditLogs(auditData);
        if (expensesData) setExpenses(expensesData);
    };

    useEffect(() => {
        let isMounted = true;
        async function load() {
            const [s, p, a, e] = await Promise.all([
                getSummary(), getProposals(), getAuditLogs(), getExpenses()
            ]);
            if (isMounted) {
                if (s) setSummary(s);
                if (p) setProposals(p);
                if (a) setAuditLogs(a);
                if (e) setExpenses(e);
            }
        }
        load();
        return () => { isMounted = false; };
    }, [getSummary, getProposals, getAuditLogs, getExpenses]);

    /* ─── Derived Data ─── */
    const totalProposals = summary
        ? (summary.pendingProposals + summary.approvedProposals + summary.rejectedProposals + (summary.expiredProposals || 0))
        : 0;

    const donutData = useMemo(() => {
        if (!summary) return [];
        return [
            { name: 'Pending', value: summary.pendingProposals },
            { name: 'Approved', value: summary.approvedProposals },
            { name: 'Rejected', value: summary.rejectedProposals },
            { name: 'Expired', value: summary.expiredProposals || 0 }
        ].filter(d => d.value > 0);
    }, [summary]);

    // Build a synthetic reserve trend from expense data
    const reserveTrend = useMemo(() => {
        if (!summary || !expenses) return [];
        const balance = summary.treasuryBalance;
        const totalSpent = summary.totalAmountSpent || 0;
        const initial = balance + totalSpent;

        // If we have expenses, build points from them
        if (expenses.length > 0) {
            const sorted = [...expenses]
                .sort((a, b) => new Date(a.Record.timestamp) - new Date(b.Record.timestamp));
            let running = initial;
            const points = [{ label: 'Init', value: initial }];
            sorted.forEach((exp, i) => {
                running -= (exp.Record.amount || 0);
                const ts = exp.Record.timestamp;
                const d = ts ? new Date(ts) : null;
                const label = d ? `${d.getMonth() + 1}/${d.getDate()}` : `T${i + 1}`;
                points.push({ label, value: running });
            });
            return points;
        }

        // Fallback: show a flat line
        return [
            { label: 'Start', value: initial },
            { label: 'Now', value: balance }
        ];
    }, [summary, expenses]);

    const pendingQueue = useMemo(() => {
        return proposals
            .filter(p => p.Record.status === 'PENDING')
            .map(p => ({
                id: p.Key,
                ...parseProposalPurpose(p.Record.purpose),
                amount: p.Record.amount,
                votes: p.Record.votes,
                status: p.Record.status
            }));
    }, [proposals]);

    // Compute proposals nearing expiry (within 3 days)
    const nearingExpiry = useMemo(() => {
        const today = new Date();
        return pendingQueue.filter(p => {
            if (p.requiredByDate === 'N/A') return false;
            const deadline = new Date(p.requiredByDate);
            const diff = (deadline - today) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 3;
        }).length;
    }, [pendingQueue]);

    const healthStatus = useMemo(() => {
        if (!summary) return { label: 'Loading', color: 'text-muted-foreground', bg: 'bg-white/5' };
        const balance = summary.treasuryBalance;
        const pending = summary.pendingProposals;
        if (balance <= 0 || nearingExpiry >= 3) return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle };
        if (nearingExpiry >= 1 || pending >= 5 || balance < 100000) return { label: 'Attention Required', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle };
        return { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Heart };
    }, [summary, nearingExpiry]);

    // Recent activity from audit logs
    const recentActivity = useMemo(() => {
        if (!auditLogs || auditLogs.length === 0) return [];
        return [...auditLogs]
            .sort((a, b) => new Date(b.Record.timestamp) - new Date(a.Record.timestamp))
            .slice(0, 6)
            .map(log => {
                const r = log.Record;
                const typeMap = {
                    'PROPOSAL_CREATED': { icon: Plus, color: 'text-[#E5383B]', bg: 'bg-[#C1121F]/15', label: 'Proposal Created' },
                    'VOTE_CAST': { icon: Vote, color: 'text-primary', bg: 'bg-primary/10', label: 'Vote Cast' },
                    'PROPOSAL_APPROVED': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Proposal Approved' },
                    'PROPOSAL_REJECTED': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Proposal Rejected' },
                    'RESERVE_DEDUCTION': { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Expense Released' },
                    'EXPENSE_CREATED': { icon: Receipt, color: 'text-[#E5383B]', bg: 'bg-[#C1121F]/15', label: 'Expense Recorded' },
                    'FUNDING_PROPOSAL_CREATED': { icon: Plus, color: 'text-[#E5383B]', bg: 'bg-[#C1121F]/15', label: 'Funding Requested' },
                    'FUNDING_VOTE_CAST': { icon: Vote, color: 'text-primary', bg: 'bg-primary/10', label: 'Funding Vote' },
                    'FUNDING_PROPOSAL_APPROVED': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Funding Approved' },
                    'FUNDING_PROPOSAL_REJECTED': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Funding Rejected' },
                    'RESERVE_ADDITION': { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Funds Added' },
                    'FUNDING_PROPOSAL_CONFIRMED': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Funding Confirmed' }
                };
                const info = typeMap[r.eventType] || { icon: Activity, color: 'text-muted-foreground', bg: 'bg-white/5', label: r.eventType };
                const ts = r.timestamp ? new Date(r.timestamp) : null;
                return {
                    ...info,
                    proposalId: r.proposalId,
                    org: r.organization?.replace('MSP', '') || 'System',
                    details: r.details,
                    time: ts ? ts.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
                };
            });
    }, [auditLogs]);

    /* ─── Loading State ─── */
    if (isLoading && !summary) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Stack align="center" spacing="md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <BodyText className="text-muted-foreground">Syncing ledger data...</BodyText>
                </Stack>
            </div>
        );
    }

    /* ─── KPI Definitions ─── */
    const kpis = [
        { label: 'Treasury Reserve', value: summary ? formatCurrency(summary.treasuryBalance) : '$—', icon: Landmark, iconBg: 'bg-primary/10', iconColor: 'text-primary', trend: null },
        { label: 'Funds Added', value: summary ? formatCurrency(summary.totalFundsAdded || 0) : '$—', icon: TrendingUp, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
        { label: 'Pending Funding', value: summary?.pendingFundingProposals ?? '—', icon: Clock, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
        { label: 'Total Proposals', value: totalProposals, icon: FileText, iconBg: 'bg-[#C1121F]/15', iconColor: 'text-[#E5383B]' },
        { label: 'Pending Exp.', value: summary?.pendingProposals ?? '—', icon: Clock, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
        { label: 'Approved Exp.', value: summary?.approvedProposals ?? '—', icon: CheckCircle2, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
        { label: 'Expired Exp.', value: summary?.expiredProposals ?? 0, icon: XCircle, iconBg: 'bg-white/5 border border-white/5', iconColor: 'text-muted-foreground' },
        { label: 'Total Expenses', value: summary?.totalExpenses ?? '—', icon: Receipt, iconBg: 'bg-[#C1121F]/15', iconColor: 'text-[#E5383B]' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Treasury Management</p>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {user.username}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        <strong className="text-white/80">{user.userIdentity}</strong> · {formatOrgName(user.organization)}
                    </p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)} 
                    disabled={user?.role !== 'admin'} 
                    className="gap-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={user?.role !== 'admin' ? 'Admin Only' : ''}
                >
                    <Plus className="h-4 w-4" />
                    New Proposal {user?.role !== 'admin' && '(Admin Only)'}
                </Button>
            </div>

            {/* ─── KPI Row ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {kpis.map((kpi) => (
                    <GlassCard key={kpi.label} className="p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={`p-1.5 rounded-lg ${kpi.iconBg}`}>
                                <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</span>
                        </div>
                        <div className="text-xl font-bold text-white tracking-tight">{kpi.value}</div>
                    </GlassCard>
                ))}
            </div>

            {/* ─── Analytics Row (Charts + Health) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Reserve Trend */}
                <GlassCard className="p-5 lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold text-white uppercase tracking-wider">Reserve Trend</span>
                        </div>
                        {summary && (
                            <span className="text-xs text-muted-foreground">
                                {summary.totalAmountSpent > 0 ? (
                                    <span className="flex items-center gap-1 text-red-400">
                                        <TrendingDown className="h-3 w-3" />
                                        {formatCurrency(summary.totalAmountSpent)} spent
                                    </span>
                                ) : (
                                    <span className="text-emerald-400">No deductions</span>
                                )}
                            </span>
                        )}
                    </div>
                    <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reserveTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="reserveGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<AreaTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#reserveGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Proposal Status Donut */}
                <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-white uppercase tracking-wider">Proposal Status</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-[160px] w-[160px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData.length > 0 ? donutData : [{ name: 'No data', value: 1 }]}
                                        cx="50%" cy="50%"
                                        innerRadius={48} outerRadius={72}
                                        paddingAngle={donutData.length > 1 ? 3 : 0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {donutData.length > 0 ? (
                                            donutData.map((entry) => (
                                                <Cell key={entry.name} fill={DONUT_COLORS[entry.name]} />
                                            ))
                                        ) : (
                                            <Cell fill="rgba(255,255,255,0.05)" />
                                        )}
                                    </Pie>
                                    <Tooltip content={<DonutTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {Object.entries(DONUT_COLORS).map(([name, color]) => {
                                const val = donutData.find(d => d.name === name)?.value ?? 0;
                                return (
                                    <div key={name} className="flex items-center gap-2 text-xs">
                                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <span className="text-muted-foreground w-16">{name}</span>
                                        <span className="font-bold text-white">{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>

                {/* Treasury Health */}
                <GlassCard className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold text-white uppercase tracking-wider">Treasury Health</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${healthStatus.bg} ${healthStatus.color} mb-4`}>
                            {healthStatus.icon && <healthStatus.icon className="h-4 w-4" />}
                            {healthStatus.label}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Reserve Balance</span>
                                <span className="font-semibold text-white">{summary ? formatCurrency(summary.treasuryBalance) : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Total Disbursed</span>
                                <span className="font-semibold text-white">{summary ? formatCurrency(summary.totalAmountSpent) : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Nearing Expiry</span>
                                <span className={`font-semibold ${nearingExpiry > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{nearingExpiry} proposal{nearingExpiry !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Awaiting Votes</span>
                                <span className="font-semibold text-white">{summary?.pendingProposals ?? 0}</span>
                            </div>
                        </div>
                    </div>
                    {/* Utilization bar */}
                    {summary && (summary.treasuryBalance + summary.totalAmountSpent) > 0 && (
                        <div className="mt-5">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Utilization</span>
                                <span>{Math.round((summary.totalAmountSpent / (summary.treasuryBalance + summary.totalAmountSpent)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-700 rounded-full"
                                    style={{ width: `${(summary.totalAmountSpent / (summary.treasuryBalance + summary.totalAmountSpent)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* ─── Main Content Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pending Approval Queue */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Hammer className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-white">Pending Approval Queue</span>
                            {pendingQueue.length > 0 && (
                                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{pendingQueue.length}</span>
                            )}
                        </div>
                        <Link to="/dashboard/voting" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                            Review all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {pendingQueue.length > 0 ? (
                        <div className="grid gap-3">
                            {pendingQueue.slice(0, 4).map((p) => (
                                <Link key={p.id} to={`/dashboard/voting/${p.id}`}>
                                    <GlassCard className="p-4 hover:border-primary/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[10px] font-mono text-muted-foreground">{p.id}</span>
                                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0">{p.category}</Badge>
                                                    <span className={`text-[10px] font-bold ${getPriorityColor(p.priority)}`}>{p.priority}</span>
                                                </div>
                                                <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{p.title}</p>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-primary">{formatCurrency(p.amount)}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {p.requiredByDate !== 'N/A' ? `Due ${p.requiredByDate}` : 'No deadline'}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <div className="flex gap-0.5">
                                                        {[0, 1, 2, 3].map(i => (
                                                            <div key={i} className={`h-1.5 w-3 rounded-full ${i < p.votes ? 'bg-primary' : 'bg-white/10'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground">{p.votes}/4</span>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mb-2" />
                            <p className="text-sm text-muted-foreground">All caught up — no proposals require action.</p>
                        </GlassCard>
                    )}
                </div>

                {/* Recent Activity Timeline */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-white">Recent Activity</span>
                        </div>
                        <Link to="/dashboard/audit" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                            Full log <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <GlassCard className="p-4">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-0">
                                {recentActivity.map((evt, idx) => (
                                    <div key={idx} className="flex gap-3 py-2.5 border-b border-white/[0.03] last:border-b-0">
                                        <div className={`p-1.5 rounded-lg shrink-0 self-start ${evt.bg}`}>
                                            <evt.icon className={`h-3 w-3 ${evt.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs font-medium text-white">{evt.label}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{evt.proposalId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground truncate">{evt.org}</span>
                                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{evt.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No recent activity recorded.</p>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* ─── Quick Actions ─── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-white">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link to="/dashboard/proposals">
                        <GlassCard className="p-5 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-white/[0.02] transition-all cursor-pointer group text-center">
                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Proposals</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">View & manage</div>
                            </div>
                        </GlassCard>
                    </Link>

                    <Link to="/dashboard/voting">
                        <GlassCard className="p-5 flex flex-col items-center gap-3 hover:border-amber-500/40 hover:bg-white/[0.02] transition-all cursor-pointer group text-center">
                            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                                <Hammer className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Cast Votes</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Review & approve</div>
                            </div>
                        </GlassCard>
                    </Link>

                    <Link to="/dashboard/audit">
                        <GlassCard className="p-5 flex flex-col items-center gap-3 hover:border-emerald-500/40 hover:bg-white/[0.02] transition-all cursor-pointer group text-center">
                            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Audit Trail</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Immutable log</div>
                            </div>
                        </GlassCard>
                    </Link>

                    <Link to="/dashboard/expenses">
                        <GlassCard className="p-5 flex flex-col items-center gap-3 hover:border-[#C1121F]/40 hover:bg-white/[0.02] transition-all cursor-pointer group text-center border-[#2A2A2A]">
                            <div className="p-3 bg-[#C1121F]/15 rounded-xl group-hover:bg-[#C1121F]/25 transition-colors">
                                <Receipt className="h-6 w-6 text-[#E5383B]" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Expenses</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Track payouts</div>
                            </div>
                        </GlassCard>
                    </Link>
                </div>
            </div>

            {/* ─── Create Proposal Modal ─── */}
            <CreateProposalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }}
            />
        </div>
    );
}
