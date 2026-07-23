import React from 'react';
import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmVoteModal({ isOpen, onClose, onConfirm, voteType, isLoading }) {
    const isApprove = voteType === 'APPROVE';
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Your Vote">
            <div className="flex flex-col gap-6 mt-4">
                <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                    isApprove ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
                }`}>
                    <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                        isApprove ? 'text-emerald-400' : 'text-destructive'
                    }`} />
                    <div className="text-sm leading-relaxed">
                        You are about to cast an immutable vote to <strong className="uppercase">{voteType}</strong> this proposal. 
                        Once submitted, this action cannot be undone and will be permanently recorded on the blockchain.
                    </div>
                </div>
                
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant={isApprove ? 'success' : 'destructive'} 
                        onClick={onConfirm} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Submitting...' : `Yes, ${voteType}`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
