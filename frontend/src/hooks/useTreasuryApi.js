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

    const getProposalHistory = useCallback((id) => {
        return handleRequest(() => api.get(`/treasury/proposals/${id}/history`));
    }, []);

    const getNetworkConfig = useCallback(() => {
        return handleRequest(() => api.get('/treasury/network-config'));
    }, []);

    const getFundingProposals = useCallback(() => {
        return handleRequest(() => api.get('/treasury/funding'));
    }, []);

    const getFundingProposalById = useCallback((id) => {
        return handleRequest(() => api.get(`/treasury/funding/${id}`));
    }, []);

    const createFundingProposal = useCallback((data) => {
        return handleRequest(
            () => api.post('/treasury/funding', data),
            'Funding proposal created successfully'
        );
    }, []);

    const voteOnFundingProposal = useCallback((id, vote) => {
        return handleRequest(
            () => api.post(`/treasury/funding/${id}/vote`, { vote }),
            'Vote submitted successfully'
        );
    }, []);

    const confirmFundingProposal = useCallback((id) => {
        return handleRequest(
            () => api.post(`/treasury/funding/${id}/confirm`),
            'Funding proposal confirmed successfully'
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
        voteOnProposal,
        getProposalHistory,
        getNetworkConfig,
        getFundingProposals,
        getFundingProposalById,
        createFundingProposal,
        voteOnFundingProposal,
        confirmFundingProposal
    };
}
