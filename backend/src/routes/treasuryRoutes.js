const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication middleware to all treasury routes
router.use(authMiddleware);

// GET /api/treasury/summary - Read-only query to get ledger stats
router.get('/summary', treasuryController.getSummary);

// POST /api/treasury/proposals - Submits a transaction to create a proposal (Admin only)
router.post('/proposals', requireRole('admin'), treasuryController.createProposal);

// POST /api/treasury/proposals/:id/vote - Submits a transaction to vote on a proposal (Admin only)
router.post('/proposals/:id/vote', requireRole('admin'), treasuryController.voteProposal);

// GET /api/treasury/proposals - Read-only query to fetch all proposals
router.get('/proposals', treasuryController.listProposals);

// GET /api/treasury/proposals/:id - Read-only query to fetch a proposal by ID
router.get('/proposals/:id', treasuryController.getProposal);

// GET /api/treasury/reserve - Read-only query to fetch treasury reserve details
router.get('/reserve', treasuryController.getReserve);

// GET /api/treasury/expenses - Read-only query to fetch all expense records
router.get('/expenses', treasuryController.getExpenses);

// GET /api/treasury/audit-logs - Read-only query to fetch all audit logs
router.get('/audit-logs', treasuryController.getAuditLogs);

// GET /api/treasury/proposals/:id/history - Read-only query to fetch proposal state history
router.get('/proposals/:id/history', treasuryController.getProposalHistory);

// GET /api/treasury/network-config - Returns network metadata (channel, chaincode)
router.get('/network-config', treasuryController.getNetworkConfig);

// GET /api/treasury/funding/pending
router.get('/funding/pending', treasuryController.listFundingProposals);

// GET /api/treasury/funding/approved
router.get('/funding/approved', treasuryController.listFundingProposals);

// GET /api/treasury/funding/rejected
router.get('/funding/rejected', treasuryController.listFundingProposals);

// POST /api/treasury/funding - Submits a transaction to create a funding proposal (Admin only)
router.post('/funding', requireRole('admin'), treasuryController.createFundingProposal);

// GET /api/treasury/funding - Read-only query to fetch all funding proposals
router.get('/funding', treasuryController.listFundingProposals);

// GET /api/treasury/funding/:id - Read-only query to fetch a funding proposal by ID
router.get('/funding/:id', treasuryController.getFundingProposal);

// POST /api/treasury/funding/:id/vote - Submits a transaction to vote on a funding proposal (Admin only)
router.post('/funding/:id/vote', requireRole('admin'), treasuryController.voteFundingProposal);

// POST /api/treasury/funding/:id/confirm - Submits a transaction to confirm a funding proposal (Admin only)
router.post('/funding/:id/confirm', requireRole('admin'), treasuryController.confirmFundingProposal);

module.exports = router;
