'use strict';

const { Contract } = require('fabric-contract-api');

const REQUIRED_APPROVALS = 4;
const AUTHORIZED_ORGS = ['FinanceMSP', 'TrusteeMSP', 'OperationsMSP', 'AuditMSP'];

class TreasuryContract extends Contract {

    async InitLedger(ctx) {
        const reserve = {
            docType: 'reserve',
            balance: 1000000
        };
        await ctx.stub.putState('TreasuryReserve', Buffer.from(JSON.stringify(reserve)));
        
        const counter = {
            docType: 'counter',
            value: 0
        };
        await ctx.stub.putState('ProposalCounter', Buffer.from(JSON.stringify(counter)));
        console.log('Treasury Reserve initialized with 1,000,000 and Proposal Counter initialized to 0.');
    }

    async CreateProposal(ctx, amountStr, purpose) {
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Amount must be a positive integer.');
        }

        if (!purpose || purpose.trim() === '') {
            throw new Error('Purpose must not be empty or whitespace-only.');
        }

        const reserveBytes = await ctx.stub.getState('TreasuryReserve');
        if (!reserveBytes || reserveBytes.length === 0) {
            throw new Error('TreasuryReserve does not exist.');
        }
        const reserve = JSON.parse(reserveBytes.toString('utf8'));
        
        if (amount > reserve.balance) {
            throw new Error(`Proposed amount (${amount}) exceeds current Treasury Reserve balance (${reserve.balance}).`);
        }

        let counterValue = 0;
        const counterBytes = await ctx.stub.getState('ProposalCounter');
        if (counterBytes && counterBytes.length > 0) {
            const counterObj = JSON.parse(counterBytes.toString('utf8'));
            counterValue = counterObj.value;
        }
        
        counterValue += 1;
        
        const counterUpdate = {
            docType: 'counter',
            value: counterValue
        };
        await ctx.stub.putState('ProposalCounter', Buffer.from(JSON.stringify(counterUpdate)));

        const proposalId = 'P' + counterValue.toString().padStart(3, '0');

        const proposal = {
            docType: 'proposal',
            proposalId: proposalId,
            amount: amount,
            purpose: purpose,
            status: 'PENDING',
            votes: 0,
            votedOrgs: [],
            voteDetails: {}
        };

        await ctx.stub.putState(proposalId, Buffer.from(JSON.stringify(proposal)));
        await this._createAuditLog(ctx, 'PROPOSAL_CREATED', proposalId, `Proposal created for amount ${amount}`);
        
        const eventPayload = {
            proposalId: proposalId,
            amount: amount,
            purpose: purpose,
            status: 'PENDING',
            transactionId: ctx.stub.getTxID(),
            timestamp: this._getTxTimestampIso(ctx)
        };
        ctx.stub.setEvent('ProposalCreated', Buffer.from(JSON.stringify(eventPayload)));

        return JSON.stringify(proposal);
    }

    async VoteOnProposal(ctx, proposalId, vote) {
        if (vote !== 'APPROVE' && vote !== 'REJECT') {
            throw new Error(`Vote must be APPROVE or REJECT. Received: ${vote}`);
        }

        const clientIdentity = ctx.clientIdentity;
        const orgId = clientIdentity.getMSPID();

        if (!AUTHORIZED_ORGS.includes(orgId)) {
            throw new Error(`Organization ${orgId} is not authorized to vote on treasury proposals.`);
        }

        const proposal = await this._getProposal(ctx, proposalId);

        if (proposal.status !== 'PENDING') {
            throw new Error(`Proposal ${proposalId} is already ${proposal.status}.`);
        }

        if (proposal.votedOrgs.includes(orgId)) {
            throw new Error(`Organization ${orgId} has already voted on proposal ${proposalId}.`);
        }

        proposal.votedOrgs.push(orgId);
        proposal.voteDetails = proposal.voteDetails || {};
        proposal.voteDetails[orgId] = {
            vote: vote,
            timestamp: this._getTxTimestampIso(ctx),
            txId: ctx.stub.getTxID()
        };

        if (vote === 'REJECT') {
            proposal.status = 'REJECTED';
            await this._createAuditLog(ctx, 'PROPOSAL_REJECTED', proposalId, `Proposal rejected by ${orgId}`);
            const eventPayload = {
                proposalId: proposalId,
                status: 'REJECTED',
                organization: orgId,
                transactionId: ctx.stub.getTxID(),
                timestamp: this._getTxTimestampIso(ctx)
            };
            ctx.stub.setEvent('ProposalRejected', Buffer.from(JSON.stringify(eventPayload)));
        } else {
            proposal.votes += 1;
            if (proposal.votes >= REQUIRED_APPROVALS) {
                proposal.status = 'APPROVED';
                await this._createAuditLog(ctx, 'PROPOSAL_APPROVED', proposalId, `Proposal reached ${REQUIRED_APPROVALS}/${REQUIRED_APPROVALS} approvals`);
                const eventPayload = {
                    proposalId: proposalId,
                    status: 'APPROVED',
                    transactionId: ctx.stub.getTxID(),
                    timestamp: this._getTxTimestampIso(ctx)
                };
                ctx.stub.setEvent('ProposalApproved', Buffer.from(JSON.stringify(eventPayload)));
                await this._processApprovedProposal(ctx, proposal);
            }
        }

        await ctx.stub.putState(proposalId, Buffer.from(JSON.stringify(proposal)));
        await this._createAuditLog(ctx, 'VOTE_CAST', proposalId, `Vote ${vote} cast by ${orgId}`);
        return JSON.stringify(proposal);
    }

    async _processApprovedProposal(ctx, proposal) {
        const reserveAsBytes = await ctx.stub.getState('TreasuryReserve');
        if (!reserveAsBytes || reserveAsBytes.length === 0) {
            throw new Error('TreasuryReserve does not exist.');
        }

        const reserve = JSON.parse(reserveAsBytes.toString());

        if (reserve.balance < proposal.amount) {
            throw new Error(`Insufficient funds in TreasuryReserve. Balance: ${reserve.balance}, Requested: ${proposal.amount}`);
        }

        reserve.balance -= proposal.amount;
        await ctx.stub.putState('TreasuryReserve', Buffer.from(JSON.stringify(reserve)));
        await this._createAuditLog(ctx, 'RESERVE_DEDUCTION', proposal.proposalId, `Deducted ${proposal.amount} from reserve. New balance: ${reserve.balance}`);

        const expenseRecord = {
            docType: 'expense',
            proposalId: proposal.proposalId,
            amount: proposal.amount,
            purpose: proposal.purpose,
            timestamp: this._getTxTimestampIso(ctx)
        };
        const expenseKey = `EXPENSE_${proposal.proposalId}`;
        await ctx.stub.putState(expenseKey, Buffer.from(JSON.stringify(expenseRecord)));
        await this._createAuditLog(ctx, 'EXPENSE_CREATED', proposal.proposalId, `Expense record created with key ${expenseKey}`);

        const eventPayload = {
            proposalId: proposal.proposalId,
            amount: proposal.amount,
            purpose: proposal.purpose,
            transactionId: ctx.stub.getTxID(),
            timestamp: expenseRecord.timestamp
        };
        ctx.stub.setEvent('ExpenseCreated', Buffer.from(JSON.stringify(eventPayload)));
    }

    async QueryReserve(ctx) {
        const reserveAsBytes = await ctx.stub.getState('TreasuryReserve');
        if (!reserveAsBytes || reserveAsBytes.length === 0) {
            throw new Error('TreasuryReserve does not exist.');
        }
        return reserveAsBytes.toString();
    }

    async QueryProposal(ctx, proposalId) {
        const proposal = await this._getProposal(ctx, proposalId);
        return JSON.stringify(proposal);
    }

    async QueryRejectedProposals(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'proposal' && record.status === 'REJECTED') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async QueryPendingProposals(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'proposal' && record.status === 'PENDING') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async QueryApprovedProposals(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'proposal' && record.status === 'APPROVED') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async QueryAllProposals(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'proposal') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async QueryAuditLogs(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                continue;
            }
            if (record.docType === 'audit') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async _createAuditLog(ctx, eventType, proposalId, details) {
        const timestamp = this._getTxTimestampIso(ctx);
        const txId = ctx.stub.getTxID();
        let orgId = 'SYSTEM';
        try {
            orgId = ctx.clientIdentity.getMSPID();
        } catch (err) {}
        const eventId = `AUDIT_${txId}_${eventType}`;

        const auditRecord = {
            docType: 'audit',
            eventId: eventId,
            eventType: eventType,
            proposalId: proposalId,
            organization: orgId,
            timestamp: timestamp,
            transactionId: txId,
            details: details
        };
        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(auditRecord)));
    }

    async QueryAllExpenses(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType === 'expense') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async GetDashboardSummary(ctx) {
        const summary = {
            treasuryBalance: 0,
            pendingProposals: 0,
            approvedProposals: 0,
            rejectedProposals: 0,
            totalExpenses: 0,
            totalAmountSpent: 0
        };

        try {
            const reserveBytes = await ctx.stub.getState('TreasuryReserve');
            if (reserveBytes && reserveBytes.length > 0) {
                const reserve = JSON.parse(reserveBytes.toString('utf8'));
                summary.treasuryBalance = reserve.balance || 0;
            }
        } catch (err) {
            console.log("Error querying TreasuryReserve:", err);
        }

        const startKey = '';
        const endKey = '';
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            if (key === 'TreasuryReserve' || key === 'ProposalCounter' || key.startsWith('AUDIT_')) continue;
            
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                continue;
            }

            if (record.docType === 'proposal') {
                if (record.status === 'PENDING') summary.pendingProposals++;
                else if (record.status === 'APPROVED') summary.approvedProposals++;
                else if (record.status === 'REJECTED') summary.rejectedProposals++;
            } else if (record.docType === 'expense') {
                summary.totalExpenses++;
                summary.totalAmountSpent += (record.amount || 0);
            }
        }

        return JSON.stringify(summary);
    }

    async GetProposalHistory(ctx, proposalId) {
        const iterator = await ctx.stub.getHistoryForKey(proposalId);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value) {
                const valueObj = res.value;
                const result = {
                    txId: valueObj.txId,
                    timestamp: valueObj.timestamp,
                    isDelete: valueObj.isDelete
                };
                if (valueObj.isDelete) {
                    result.state = null;
                } else {
                    try {
                        result.state = JSON.parse(valueObj.value.toString('utf8'));
                    } catch (err) {
                        result.state = valueObj.value.toString('utf8');
                    }
                }
                allResults.push(result);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }

    async ProposalExists(ctx, proposalId) {
        const proposalBytes = await ctx.stub.getState(proposalId);
        return proposalBytes && proposalBytes.length > 0;
    }

    _getTxTimestampIso(ctx) {
        const txTimestamp = ctx.stub.getTxTimestamp();
        return new Date(txTimestamp.seconds * 1000 + Math.floor(txTimestamp.nanos / 1000000)).toISOString();
    }

    async _getProposal(ctx, proposalId) {
        const proposalBytes = await ctx.stub.getState(proposalId);
        if (!proposalBytes || proposalBytes.length === 0) {
            throw new Error(`The proposal ${proposalId} does not exist.`);
        }
        return JSON.parse(proposalBytes.toString());
    }
}

module.exports = TreasuryContract;
