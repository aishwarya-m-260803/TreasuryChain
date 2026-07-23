const treasuryService = require('../services/treasuryService');

/**
 * Controller to handle the GetDashboardSummary request.
 * It is decoupled from Fabric logic and only handles HTTP request/response formatting.
 */
async function getSummary(req, res) {
    try {
        const summary = await treasuryService.getDashboardSummary();
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
 * Validates request payload and passes the parameters to the service layer.
 */
async function createProposal(req, res) {
    try {
        const { amount, purpose } = req.body;

        // Perform basic input validation
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

        // Call the service with amount formatted as string (chaincode requirements)
        const proposal = await treasuryService.createProposal(parsedAmount.toString(), purpose.trim());

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
 * Validates request payload and passes the parameters to the service layer.
 */
async function voteProposal(req, res) {
    try {
        const { id } = req.params;
        const { vote } = req.body;

        // Perform basic input validation
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

        // Call the service
        const updatedProposal = await treasuryService.voteOnProposal(id.trim(), vote);

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
 * Validates request payload and passes the parameters to the service layer.
 */
async function getProposal(req, res) {
    try {
        const { id } = req.params;

        // Perform basic input validation
        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Proposal ID is required.'
            });
        }

        // Call the service
        const proposal = await treasuryService.getProposalById(id.trim());

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
 * Invokes the service layer and returns proposals from the ledger.
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
            proposals = await treasuryService.listProposalsByStatus(upperStatus);
        } else {
            proposals = await treasuryService.listAllProposals();
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
 * Invokes the service layer and returns the treasury reserve balance.
 */
async function getReserve(req, res) {
    try {
        const reserve = await treasuryService.getReserveDetails();
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
 * Invokes the service layer and returns all expense records from the ledger.
 */
async function getExpenses(req, res) {
    try {
        const expenses = await treasuryService.listExpenses();
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
 * Invokes the service layer and returns all audit logs from the ledger.
 */
async function getAuditLogs(req, res) {
    try {
        const auditLogs = await treasuryService.listAuditLogs();
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
 * Validates request parameters and passes the ID to the service layer.
 */
async function getProposalHistory(req, res) {
    try {
        const { id } = req.params;

        // Perform basic input validation
        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Proposal ID is required.'
            });
        }

        // Call the service
        const history = await treasuryService.getProposalHistory(id.trim());

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

module.exports = {
    getSummary,
    createProposal,
    voteProposal,
    getProposal,
    listProposals,
    getReserve,
    getExpenses,
    getAuditLogs,
    getProposalHistory
};
