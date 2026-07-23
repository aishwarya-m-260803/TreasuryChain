const { getContract } = require('./gatewayService');

/**
 * Executes a read-only transaction on the ledger using evaluateTransaction.
 * This does not send the transaction to the ordering service, making it fast.
 */
async function getDashboardSummary() {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries. 
        // It queries the local peer and does not create a block.
        const resultBytes = await contract.evaluateTransaction('GetDashboardSummary');
        
        // The chaincode returns a JSON string as bytes, decode and parse it.
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in getDashboardSummary:', error);
        throw new Error(`Failed to query dashboard summary: ${error.message}`);
    }
}

/**
 * Submits a transaction to create a new proposal on the ledger.
 * This sends the transaction to the ordering service to be committed to a block.
 */
async function createProposal(amountStr, purpose) {
    try {
        const { contract } = await getContract();
        
        // Use submitTransaction for transactions that modify state.
        const resultBytes = await contract.submitTransaction('CreateProposal', amountStr, purpose);
        
        // Decode and parse the returned proposal JSON string.
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in createProposal:', error);
        throw new Error(`Failed to create proposal: ${error.message}`);
    }
}

/**
 * Submits a transaction to vote on a proposal on the ledger.
 * This sends the transaction to the ordering service to be committed to a block.
 */
async function voteOnProposal(proposalId, vote) {
    try {
        const { contract } = await getContract();
        
        // Use submitTransaction since voting modifies the ledger state (votedOrgs, votes, details).
        const resultBytes = await contract.submitTransaction('VoteOnProposal', proposalId, vote);
        
        // Decode and parse the returned proposal JSON string.
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in voteOnProposal:', error);
        throw new Error(`Failed to vote on proposal: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get details of a specific proposal.
 */
async function getProposalById(proposalId) {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('QueryProposal', proposalId);
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in getProposalById for ID ${proposalId}:`, error);
        throw new Error(`Failed to query proposal by ID: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get all proposals.
 */
async function listAllProposals() {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('QueryAllProposals');
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in listAllProposals:', error);
        throw new Error(`Failed to query all proposals: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to filter proposals by status.
 * Maps to QueryPendingProposals, QueryApprovedProposals, or QueryRejectedProposals.
 */
async function listProposalsByStatus(status) {
    try {
        const { contract } = await getContract();
        
        let txName;
        const upperStatus = status.toUpperCase();
        if (upperStatus === 'PENDING') {
            txName = 'QueryPendingProposals';
        } else if (upperStatus === 'APPROVED') {
            txName = 'QueryApprovedProposals';
        } else if (upperStatus === 'REJECTED') {
            txName = 'QueryRejectedProposals';
        } else {
            throw new Error(`Unsupported status: ${status}`);
        }

        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction(txName);
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in listProposalsByStatus for status ${status}:`, error);
        throw new Error(`Failed to query proposals by status: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get the current treasury reserve details.
 */
async function getReserveDetails() {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('QueryReserve');
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in getReserveDetails:', error);
        throw new Error(`Failed to query reserve details: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get all expense records.
 */
async function listExpenses() {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('QueryAllExpenses');
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in listExpenses:', error);
        throw new Error(`Failed to query expense records: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get all audit logs.
 */
async function listAuditLogs() {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('QueryAuditLogs');
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in listAuditLogs:', error);
        throw new Error(`Failed to query audit logs: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get the modification history of a specific proposal.
 */
async function getProposalHistory(proposalId) {
    try {
        const { contract } = await getContract();
        
        // Use evaluateTransaction for read-only queries.
        const resultBytes = await contract.evaluateTransaction('GetProposalHistory', proposalId);
        
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in getProposalHistory for ID ${proposalId}:`, error);
        throw new Error(`Failed to query proposal history: ${error.message}`);
    }
}

module.exports = {
    getDashboardSummary,
    createProposal,
    voteOnProposal,
    getProposalById,
    listAllProposals,
    listProposalsByStatus,
    getReserveDetails,
    listExpenses,
    listAuditLogs,
    getProposalHistory
};
