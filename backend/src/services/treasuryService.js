const { getContractForOrg } = require('./gatewayService');

/**
 * Executes a read-only transaction on the ledger using evaluateTransaction.
 */
async function getDashboardSummary(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.evaluateTransaction('GetDashboardSummary');
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in getDashboardSummary:', error);
        throw new Error(`Failed to query dashboard summary: ${error.message}`);
    }
}

/**
 * Submits a transaction to create a new proposal on the ledger.
 */
async function createProposal(orgFabricConfig, amountStr, purpose) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.submitTransaction('CreateProposal', amountStr, purpose);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in createProposal:', error);
        throw new Error(`Failed to create proposal: ${error.message}`);
    }
}

/**
 * Submits a transaction to vote on a proposal on the ledger.
 */
async function voteOnProposal(orgFabricConfig, proposalId, vote) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.submitTransaction('VoteOnProposal', proposalId, vote);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in voteOnProposal:', error);
        if (error.details && error.details.length > 0) {
            for (const detail of error.details) {
                if (detail.message) {
                    let msg = detail.message;
                    if (msg.includes('chaincode response 500,')) {
                        msg = msg.replace('chaincode response 500,', '').trim();
                    }
                    throw new Error(msg);
                }
            }
        }
        throw new Error(`Failed to vote on proposal: ${error.message}`);
    }
}

/**
 * Evaluates a read-only transaction on the ledger to get details of a specific proposal.
 */
async function getProposalById(orgFabricConfig, proposalId) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
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
async function listAllProposals(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
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
 */
async function listProposalsByStatus(orgFabricConfig, status) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        
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
async function getReserveDetails(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
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
async function listExpenses(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
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
async function listAuditLogs(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
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
async function getProposalHistory(orgFabricConfig, proposalId) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.evaluateTransaction('GetProposalHistory', proposalId);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in getProposalHistory for ID ${proposalId}:`, error);
        throw new Error(`Failed to query proposal history: ${error.message}`);
    }
}

async function createFundingProposal(orgFabricConfig, amountStr, organization, source, referenceNumber, reason, description) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.submitTransaction('CreateFundingProposal', amountStr, organization, source, referenceNumber, reason, description);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in createFundingProposal:', error);
        throw new Error(`Failed to create funding proposal: ${error.message}`);
    }
}

async function voteOnFundingProposal(orgFabricConfig, id, vote) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.submitTransaction('VoteFundingProposal', id, vote);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in voteOnFundingProposal:', error);
        if (error.details && error.details.length > 0) {
            for (const detail of error.details) {
                if (detail.message) {
                    let msg = detail.message;
                    if (msg.includes('chaincode response 500,')) {
                        msg = msg.replace('chaincode response 500,', '').trim();
                    }
                    throw new Error(msg);
                }
            }
        }
        throw new Error(`Failed to vote on funding proposal: ${error.message}`);
    }
}

async function confirmFundingProposal(orgFabricConfig, id, confirmedBy) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.submitTransaction('ConfirmFunding', id, confirmedBy);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in confirmFundingProposal:', error);
        if (error.details && error.details.length > 0) {
            for (const detail of error.details) {
                if (detail.message) {
                    let msg = detail.message;
                    if (msg.includes('chaincode response 500,')) {
                        msg = msg.replace('chaincode response 500,', '').trim();
                    }
                    throw new Error(msg);
                }
            }
        }
        throw new Error(`Failed to confirm funding proposal: ${error.message}`);
    }
}

async function getFundingProposalById(orgFabricConfig, id) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.evaluateTransaction('GetFundingProposal', id);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in getFundingProposalById for ID ${id}:`, error);
        throw new Error(`Failed to query funding proposal by ID: ${error.message}`);
    }
}

async function listAllFundingProposals(orgFabricConfig) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        const resultBytes = await contract.evaluateTransaction('GetAllFundingProposals');
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error('Error in listAllFundingProposals:', error);
        throw new Error(`Failed to query all funding proposals: ${error.message}`);
    }
}

async function listFundingProposalsByStatus(orgFabricConfig, status) {
    try {
        const { contract } = await getContractForOrg(orgFabricConfig);
        let txName;
        const upperStatus = status.toUpperCase();
        if (upperStatus === 'PENDING') {
            txName = 'GetPendingFundingProposals';
        } else if (upperStatus === 'APPROVED') {
            txName = 'GetApprovedFundingProposals';
        } else if (upperStatus === 'REJECTED') {
            txName = 'GetRejectedFundingProposals';
        } else {
            throw new Error(`Unsupported status: ${status}`);
        }
        const resultBytes = await contract.evaluateTransaction(txName);
        const resultJson = Buffer.from(resultBytes).toString('utf8');
        return JSON.parse(resultJson);
    } catch (error) {
        console.error(`Error in listFundingProposalsByStatus for status ${status}:`, error);
        throw new Error(`Failed to query funding proposals by status: ${error.message}`);
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
    getProposalHistory,
    createFundingProposal,
    voteOnFundingProposal,
    confirmFundingProposal,
    getFundingProposalById,
    listAllFundingProposals,
    listFundingProposalsByStatus
};
