import React, { useState } from 'react';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useTreasuryApi } from '../../../hooks/useTreasuryApi';
import { useAuth } from '../../../context/AuthContext';

export function CreateProposalModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const { createProposal, isLoading } = useTreasuryApi();

    // Fields state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Infrastructure');
    const [amount, setAmount] = useState('');
    const [requiredByDate, setRequiredByDate] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [description, setDescription] = useState('');
    const [businessImpact, setBusinessImpact] = useState('');

    const [errors, setErrors] = useState({});

    const formatOrgName = (org) => {
        if (!org) return '';
        return org.charAt(0).toUpperCase() + org.slice(1);
    };

    const submissionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Proposal title is required';
        if (!requiredByDate) newErrors.requiredByDate = 'Required by date is required';
        if (!description.trim()) newErrors.description = 'Purpose / Description is required';
        if (!businessImpact.trim()) newErrors.businessImpact = 'Expected business impact is required';

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            newErrors.amount = 'Amount must be a positive integer';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Pack the structured payload into a readable format for ledger storage
        const structuredPurpose = `[${category} | ${priority} Priority] ${title.trim()}
Required By: ${requiredByDate}
Submitted By: ${user.username} (${formatOrgName(user.organization)}) on ${submissionDate}

DESCRIPTION:
${description.trim()}

EXPECTED BUSINESS IMPACT:
${businessImpact.trim()}`;

        const success = await createProposal(parsedAmount, structuredPurpose);
        if (success) {
            setTitle('');
            setCategory('Infrastructure');
            setAmount('');
            setRequiredByDate('');
            setPriority('Medium');
            setDescription('');
            setBusinessImpact('');
            setErrors({});
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Funding Proposal" className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Submit a new proposal to request treasury funds. This will require consensus approval before execution.
                </p>

                {/* 1. Basic Information */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Basic Information
                    </h3>
                    <Input 
                        label="Proposal Title" 
                        placeholder="e.g. Server infrastructure upgrade Q4"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isLoading}
                        error={errors.title}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isLoading}
                                className="w-full h-10 px-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            >
                                <option value="Infrastructure" className="bg-neutral-900 text-white">Infrastructure</option>
                                <option value="Operations" className="bg-neutral-900 text-white">Operations</option>
                                <option value="Security" className="bg-neutral-900 text-white">Security</option>
                                <option value="Maintenance" className="bg-neutral-900 text-white">Maintenance</option>
                                <option value="Training" className="bg-neutral-900 text-white">Training</option>
                                <option value="Compliance" className="bg-neutral-900 text-white">Compliance</option>
                                <option value="Other" className="bg-neutral-900 text-white">Other</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                disabled={isLoading}
                                className="w-full h-10 px-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            >
                                <option value="Low" className="bg-neutral-900 text-white">Low</option>
                                <option value="Medium" className="bg-neutral-900 text-white">Medium</option>
                                <option value="High" className="bg-neutral-900 text-white">High</option>
                                <option value="Critical" className="bg-neutral-900 text-white">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Details */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Financial Details & Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Requested Amount ($)" 
                            type="number"
                            min="1"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            disabled={isLoading}
                            error={errors.amount}
                        />
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Required By Date
                            </label>
                            <input 
                                type="date"
                                value={requiredByDate}
                                onChange={(e) => setRequiredByDate(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full h-10 px-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            />
                            {errors.requiredByDate && (
                                <span className="text-xs text-destructive font-medium mt-0.5">{errors.requiredByDate}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Proposal Details */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Proposal Details
                    </h3>
                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Purpose / Description
                        </label>
                        <textarea
                            placeholder="Provide a detailed description of what the funding will be used for..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            disabled={isLoading}
                            rows={3}
                            className="w-full p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                        />
                        {errors.description && (
                            <span className="text-xs text-destructive font-medium mt-0.5">{errors.description}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Expected Business Impact
                        </label>
                        <textarea
                            placeholder="What are the expected outcomes and metrics for success..."
                            value={businessImpact}
                            onChange={(e) => setBusinessImpact(e.target.value)}
                            required
                            disabled={isLoading}
                            rows={3}
                            className="w-full p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                        />
                        {errors.businessImpact && (
                            <span className="text-xs text-destructive font-medium mt-0.5">{errors.businessImpact}</span>
                        )}
                    </div>
                </div>

                {/* 4. Submission Metadata (Read-only) */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-2 select-none text-left">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Submission Metadata
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Organization</span>
                            <span className="text-white font-medium">{formatOrgName(user?.organization)}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Submitted By</span>
                            <span className="text-white font-medium">{user?.username}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Submission Date</span>
                            <span className="text-white font-medium">{submissionDate}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="gap-1.5" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
