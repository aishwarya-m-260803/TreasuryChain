import React, { useState } from 'react';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useTreasuryApi } from '../../../hooks/useTreasuryApi';
import { useAuth } from '../../../context/AuthContext';

export function CreateFundingModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const { createFundingProposal, isLoading } = useTreasuryApi();

    // Fields state
    const [amount, setAmount] = useState('');
    const [organization, setOrganization] = useState('');
    const [source, setSource] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const newErrors = {};
        if (!organization.trim()) newErrors.organization = 'Organization is required';
        if (!source.trim()) newErrors.source = 'Funding source is required';
        if (!referenceNumber.trim()) newErrors.referenceNumber = 'Reference number is required';
        if (!reason.trim()) newErrors.reason = 'Reason is required';
        if (!description.trim()) newErrors.description = 'Description is required';

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            newErrors.amount = 'Amount must be a positive integer';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            amount: parsedAmount,
            organization: organization.trim(),
            source: source.trim(),
            referenceNumber: referenceNumber.trim(),
            reason: reason.trim(),
            description: description.trim()
        };

        const success = await createFundingProposal(payload);
        if (success) {
            setAmount('');
            setOrganization('');
            setSource('');
            setReferenceNumber('');
            setReason('');
            setDescription('');
            setErrors({});
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Funding Proposal" className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Submit a new proposal to inject funds into the treasury. This will require consensus approval before execution.
                </p>

                {/* Basic Information */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Amount ($)" 
                            type="number"
                            min="1"
                            placeholder="e.g. 10000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            disabled={isLoading}
                            error={errors.amount}
                        />
                        <Input 
                            label="Organization" 
                            placeholder="e.g. FinanceOrg"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            required
                            disabled={isLoading}
                            error={errors.organization}
                        />
                    </div>
                </div>

                {/* Source & Reference */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Source & Reference
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Funding Source" 
                            placeholder="e.g. Q3 Budget Allocation"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            required
                            disabled={isLoading}
                            error={errors.source}
                        />
                        <Input 
                            label="Reference Number" 
                            placeholder="e.g. REF-2024-8891"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            required
                            disabled={isLoading}
                            error={errors.referenceNumber}
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-white/5 pb-1">
                        Details
                    </h3>
                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reason
                        </label>
                        <input
                            placeholder="Brief reason for the funding..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                        />
                        {errors.reason && (
                            <span className="text-xs text-destructive font-medium mt-0.5">{errors.reason}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            placeholder="Detailed description..."
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
