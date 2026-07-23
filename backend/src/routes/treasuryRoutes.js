const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all treasury routes
router.use(authMiddleware);

// GET /api/treasury/summary - Read-only query to get ledger stats
router.get('/summary', treasuryController.getSummary);

// POST /api/treasury/proposals - Submits a transaction to create a proposal
router.post('/proposals', treasuryController.createProposal);

// POST /api/treasury/proposals/:id/vote - Submits a transaction to vote on a proposal
router.post('/proposals/:id/vote', treasuryController.voteProposal);

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

module.exports = router;
