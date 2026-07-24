const treasuryService = require('../services/treasuryService');
const fabricConfig = require('../config/fabricConfig');

/**
 * Controller to handle the GetDashboardSummary request.
 */
async function getSummary(req, res) {
    try {
        const summary = await treasuryService.getDashboardSummary(req.fabricConfig);
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the treasury summary.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the CreateProposal request.
 */
async function createProposal(req, res) {
    try {
        const { amount, purpose } = req.body;

        if (amount === undefined || amount === null) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required.'
            });
        }

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive integer.'
            });
        }

        if (!purpose || typeof purpose !== 'string' || purpose.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Purpose must not be empty.'
            });
        }

        const proposal = await treasuryService.createProposal(req.fabricConfig, parsedAmount.toString(), purpose.trim());

        res.status(201).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the proposal.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the VoteOnProposal request.
 */
async function voteProposal(req, res) {
    try {
        const { id } = req.params;
        const { vote } = req.body;

        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Proposal ID is required.'
            });
        }

        if (!vote || (vote !== 'APPROVE' && vote !== 'REJECT')) {
            return res.status(400).json({
                success: false,
                message: 'Vote must be either "APPROVE" or "REJECT".'
            });
        }

        const updatedProposal = await treasuryService.voteOnProposal(req.fabricConfig, id.trim(), vote);

        res.status(200).json({
            success: true,
            data: updatedProposal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while casting the vote.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the GetProposalById (QueryProposal) request.
 */
async function getProposal(req, res) {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Proposal ID is required.'
            });
        }

        const proposal = await treasuryService.getProposalById(req.fabricConfig, id.trim());

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the proposal.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the QueryAllProposals and status-filtered query requests.
 */
async function listProposals(req, res) {
    try {
        const { status } = req.query;

        let proposals;
        if (status) {
            const upperStatus = status.trim().toUpperCase();
            if (upperStatus !== 'PENDING' && upperStatus !== 'APPROVED' && upperStatus !== 'REJECTED') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status filter. Must be PENDING, APPROVED, or REJECTED.'
                });
            }
            proposals = await treasuryService.listProposalsByStatus(req.fabricConfig, upperStatus);
        } else {
            proposals = await treasuryService.listAllProposals(req.fabricConfig);
        }

        res.status(200).json({
            success: true,
            data: proposals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the proposals list.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the QueryReserve request.
 */
async function getReserve(req, res) {
    try {
        const reserve = await treasuryService.getReserveDetails(req.fabricConfig);
        res.status(200).json({
            success: true,
            data: reserve
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the treasury reserve details.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the QueryAllExpenses request.
 */
async function getExpenses(req, res) {
    try {
        const expenses = await treasuryService.listExpenses(req.fabricConfig);
        res.status(200).json({
            success: true,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the expense records.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the QueryAuditLogs request.
 */
async function getAuditLogs(req, res) {
    try {
        const auditLogs = await treasuryService.listAuditLogs(req.fabricConfig);
        res.status(200).json({
            success: true,
            data: auditLogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the audit logs.',
            error: error.message
        });
    }
}

/**
 * Controller to handle the GetProposalHistory request.
 */
async function getProposalHistory(req, res) {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Proposal ID is required.'
            });
        }

        const history = await treasuryService.getProposalHistory(req.fabricConfig, id.trim());

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the proposal history.',
            error: error.message
        });
    }
}

/**
 * Controller to return network configuration metadata (channel, chaincode).
 */
async function getNetworkConfig(req, res) {
    try {
        res.status(200).json({
            success: true,
            data: {
                channelName: fabricConfig.channelName,
                chaincodeName: fabricConfig.chaincodeName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching network configuration.',
            error: error.message
        });
    }
}

module.exports = {
    getSummary,
    createProposal,
    voteProposal,
    getProposal,
    listProposals,
    getReserve,
    getExpenses,
    getAuditLogs,
    getProposalHistory,
    getNetworkConfig
};
