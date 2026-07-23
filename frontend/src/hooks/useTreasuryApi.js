import { useState, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

export function useTreasuryApi() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRequest = async (requestFn, successMessage = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await requestFn();
            if (successMessage) {
                toast.success(successMessage);
            }
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getSummary = useCallback(() => {
        return handleRequest(() => api.get('/treasury/summary'));
    }, []);

    const getProposals = useCallback(() => {
        return handleRequest(() => api.get('/treasury/proposals'));
    }, []);

    const getReserveDetails = useCallback(() => {
        return handleRequest(() => api.get('/treasury/reserve'));
    }, []);

    const getExpenses = useCallback(() => {
        return handleRequest(() => api.get('/treasury/expenses'));
    }, []);

    const getAuditLogs = useCallback(() => {
        return handleRequest(() => api.get('/treasury/audit-logs'));
    }, []);

    const createProposal = useCallback((amount, purpose) => {
        return handleRequest(
            () => api.post('/treasury/proposals', { amount, purpose }),
            'Proposal created successfully'
        );
    }, []);

    const getProposalById = useCallback((id) => {
        return handleRequest(() => api.get(`/treasury/proposals/${id}`));
    }, []);

    const voteOnProposal = useCallback((id, vote) => {
        return handleRequest(
            () => api.post(`/treasury/proposals/${id}/vote`, { vote }),
            'Vote submitted successfully'
        );
    }, []);

    return {
        isLoading,
        error,
        getSummary,
        getProposals,
        getReserveDetails,
        getExpenses,
        getAuditLogs,
        createProposal,
        getProposalById,
        voteOnProposal
    };
}
