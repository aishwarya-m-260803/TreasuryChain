import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useTreasuryApi } from '../../../hooks/useTreasuryApi';
import { generateSHA256 } from '../../../utils/cryptoUtils';
import { ShieldCheck, ShieldAlert, Upload, FileCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function VerifyDocumentModal({ isOpen, onClose, defaultProposalId = '' }) {
    const { verifyDocumentHash } = useTreasuryApi();

    const [proposalId, setProposalId] = useState(defaultProposalId);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentHash, setDocumentHash] = useState('');
    const [isCalculatingHash, setIsCalculatingHash] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setProposalId(defaultProposalId || '');
            setSelectedFile(null);
            setDocumentHash('');
            setVerificationResult(null);
            setErrorMsg('');
        }
    }, [isOpen, defaultProposalId]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setVerificationResult(null);
        setErrorMsg('');
        if (file) {
            setSelectedFile(file);
            setIsCalculatingHash(true);
            try {
                const hash = await generateSHA256(file);
                setDocumentHash(hash);
            } catch (err) {
                console.error('Error calculating hash:', err);
                setErrorMsg('Failed to calculate SHA-256 hash for selected file.');
            } finally {
                setIsCalculatingHash(false);
            }
        } else {
            setSelectedFile(null);
            setDocumentHash('');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setVerificationResult(null);

        if (!proposalId.trim()) {
            setErrorMsg('Proposal ID is required.');
            return;
        }

        if (!documentHash) {
            setErrorMsg('Please select a document file to calculate its SHA-256 hash.');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await verifyDocumentHash(proposalId.trim(), documentHash);
            if (res) {
                setVerificationResult(res);
            } else {
                setErrorMsg('Verification failed. Unable to query blockchain ledger.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An error occurred during document verification.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verify Document Authenticity" className="max-w-xl">
            <form onSubmit={handleVerify} className="flex flex-col gap-5 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a document to compute its SHA-256 hash client-side and verify its authenticity against the immutable hash recorded on the Hyperledger Fabric ledger.
                </p>

                {/* Proposal ID input */}
                <Input 
                    label="Proposal ID" 
                    placeholder="e.g. P001 or F001"
                    value={proposalId}
                    onChange={(e) => setProposalId(e.target.value)}
                    required
                    disabled={isVerifying}
                />

                {/* Document File Selection */}
                <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Document File
                    </label>
                    <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-primary/50 rounded-lg p-4 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            disabled={isVerifying || isCalculatingHash} 
                            className="sr-only" 
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {isCalculatingHash ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span>Calculating SHA-256 hash...</span>
                                </>
                            ) : selectedFile ? (
                                <>
                                    <FileCheck className="h-5 w-5 text-emerald-400" />
                                    <span className="text-white font-medium">{selectedFile.name}</span>
                                    <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span>Choose file to verify against ledger...</span>
                                </>
                            )}
                        </div>
                    </label>
                </div>

                {/* Calculated SHA-256 Preview */}
                {documentHash && (
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg text-left space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Generated Browser SHA-256 Hash
                        </div>
                        <div className="text-xs font-mono text-white break-all select-all">
                            {documentHash}
                        </div>
                    </div>
                )}

                {/* Error message if any */}
                {errorMsg && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Verification Outcome Card */}
                {verificationResult && (
                    <div className={`p-4 rounded-xl border text-left flex flex-col gap-3 transition-all ${
                        verificationResult.verified 
                            ? 'bg-emerald-950/40 border-emerald-500/30' 
                            : 'bg-destructive/10 border-destructive/30'
                    }`}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                {verificationResult.verified ? (
                                    <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                                ) : (
                                    <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
                                )}
                                <div>
                                    <h4 className={`text-sm font-bold ${
                                        verificationResult.verified ? 'text-emerald-400' : 'text-destructive'
                                    }`}>
                                        {verificationResult.verified ? 'VERIFIED: TRUE' : 'VERIFIED: FALSE'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Proposal ID: <span className="text-white font-mono">{verificationResult.proposalId}</span>
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                verificationResult.verified 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                            }`}>
                                {verificationResult.verified ? 'Authentic Document' : 'Verification Failed'}
                            </span>
                        </div>

                        <p className="text-xs text-white leading-relaxed">
                            {verificationResult.message}
                        </p>

                        <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                                <span className="text-muted-foreground">Ledger Stored Hash:</span>
                                <span className="text-white break-all">
                                    {verificationResult.storedHash || '(None on ledger)'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                                <span className="text-muted-foreground">Uploaded File Hash:</span>
                                <span className="text-white break-all">
                                    {verificationResult.providedHash}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isVerifying}>
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isVerifying || isCalculatingHash || !documentHash || !proposalId.trim()}
                        className="gap-2"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Verify Document</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
