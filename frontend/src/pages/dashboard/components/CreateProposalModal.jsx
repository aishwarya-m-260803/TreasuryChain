import React, { useState } from 'react';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useTreasuryApi } from '../../../hooks/useTreasuryApi';

export function CreateProposalModal({ isOpen, onClose, onSuccess }) {
    const [purpose, setPurpose] = useState('');
    const [amount, setAmount] = useState('');
    const { createProposal, isLoading } = useTreasuryApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!purpose.trim()) {
            return;
        }
        
        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return;
        }

        const success = await createProposal(parsedAmount, purpose);
        if (success) {
            setPurpose('');
            setAmount('');
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Funding Proposal">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Submit a new proposal to request treasury funds. This will require consensus approval before execution.
                </p>
                
                <Input 
                    label="Proposal Purpose" 
                    placeholder="e.g. Server infrastructure upgrade Q4"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <Input 
                    label="Requested Amount ($)" 
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <div className="flex gap-4 justify-end mt-4">
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
