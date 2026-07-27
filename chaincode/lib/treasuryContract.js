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
        this._authorize(ctx);

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

        const orgId = this._authorize(ctx);

        const proposal = await this._getProposal(ctx, proposalId);

        this._checkProposalExpiry(ctx, proposal);

        if (proposal.status === 'EXPIRED') {
            throw new Error("Voting is no longer allowed because this proposal has expired.");
        }

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
        this._checkProposalExpiry(ctx, proposal);
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
            if (record.docType === 'proposal') {
                this._checkProposalExpiry(ctx, record);
                if (record.status === 'REJECTED') {
                    allResults.push({ Key: key, Record: record });
                }
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
            if (record.docType === 'proposal') {
                this._checkProposalExpiry(ctx, record);
                if (record.status === 'PENDING') {
                    allResults.push({ Key: key, Record: record });
                }
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
            if (record.docType === 'proposal') {
                this._checkProposalExpiry(ctx, record);
                if (record.status === 'APPROVED') {
                    allResults.push({ Key: key, Record: record });
                }
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
                this._checkProposalExpiry(ctx, record);
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
            expiredProposals: 0,
            totalExpenses: 0,
            totalAmountSpent: 0,
            totalFundsAdded: 0,
            pendingFundingProposals: 0
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
                this._checkProposalExpiry(ctx, record);
                if (record.status === 'PENDING') summary.pendingProposals++;
                else if (record.status === 'APPROVED') summary.approvedProposals++;
                else if (record.status === 'REJECTED') summary.rejectedProposals++;
                else if (record.status === 'EXPIRED') summary.expiredProposals++;
            } else if (record.docType === 'expense') {
                summary.totalExpenses++;
                summary.totalAmountSpent += (record.amount || 0);
            } else if (record.docType === 'fundingProposal') {
                if (record.status === 'Pending') {
                    summary.pendingFundingProposals++;
                } else if (record.status === 'Confirmed') {
                    summary.totalFundsAdded += (record.amount || 0);
                }
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

    _authorize(ctx, allowedOrgs = AUTHORIZED_ORGS) {
        const orgId = ctx.clientIdentity.getMSPID();
        if (!allowedOrgs.includes(orgId)) {
            throw new Error(`Organization ${orgId} is not authorized to perform this action.`);
        }
        return orgId;
    }

    _checkProposalExpiry(ctx, proposal) {
        if (proposal.status !== 'PENDING') {
            return;
        }
        const purposeStr = proposal.purpose;
        if (!purposeStr) return;
        const requiredByMatch = purposeStr.match(/Required By:\s*([^\n]+)/);
        if (requiredByMatch) {
            const requiredByDateStr = requiredByMatch[1].trim();
            if (requiredByDateStr !== 'N/A') {
                const txTimestamp = ctx.stub.getTxTimestamp();
                const txDate = new Date(txTimestamp.seconds * 1000 + Math.floor(txTimestamp.nanos / 1000000));
                const txDateString = txDate.toISOString().split('T')[0];
                if (txDateString > requiredByDateStr) {
                    proposal.status = 'EXPIRED';
                }
            }
        }
    }

    async CreateFundingProposal(ctx, amountStr, organization, source, referenceNumber, reason, description) {
        this._authorize(ctx, ['FinanceMSP']);

        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Amount must be a positive integer.');
        }

        if (!referenceNumber || referenceNumber.trim() === '') {
            throw new Error('Reference number must not be empty.');
        }
        
        // Validate duplicate reference number
        const startKey = '';
        const endKey = '';
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                continue;
            }
            if (record.docType === 'fundingProposal' && record.referenceNumber === referenceNumber) {
                throw new Error(`A funding proposal with reference number ${referenceNumber} already exists.`);
            }
        }

        let counterValue = 0;
        const counterBytes = await ctx.stub.getState('FundingProposalCounter');
        if (counterBytes && counterBytes.length > 0) {
            const counterObj = JSON.parse(counterBytes.toString('utf8'));
            counterValue = counterObj.value;
        }
        
        counterValue += 1;
        
        const counterUpdate = {
            docType: 'counter',
            value: counterValue
        };
        await ctx.stub.putState('FundingProposalCounter', Buffer.from(JSON.stringify(counterUpdate)));

        const id = 'F' + counterValue.toString().padStart(3, '0');
        const createdAt = this._getTxTimestampIso(ctx);

        const fundingProposal = {
            docType: 'fundingProposal',
            id: id,
            amount: amount,
            organization: organization,
            source: source,
            referenceNumber: referenceNumber,
            reason: reason,
            description: description,
            status: 'Pending',
            votes: 0,
            approved: false,
            confirmed: false,
            confirmedBy: '',
            createdAt: createdAt,
            confirmedAt: ''
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(fundingProposal)));
        await this._createAuditLog(ctx, 'FUNDING_PROPOSAL_CREATED', id, `Funding proposal created for amount ${amount} from ${source}`);
        
        const eventPayload = {
            id: id,
            amount: amount,
            organization: organization,
            status: 'Pending',
            transactionId: ctx.stub.getTxID(),
            timestamp: createdAt
        };
        ctx.stub.setEvent('FundingProposalCreated', Buffer.from(JSON.stringify(eventPayload)));

        return JSON.stringify(fundingProposal);
    }

    async GetFundingProposal(ctx, id) {
        const proposalBytes = await ctx.stub.getState(id);
        if (!proposalBytes || proposalBytes.length === 0) {
            throw new Error(`The funding proposal ${id} does not exist.`);
        }
        const proposal = JSON.parse(proposalBytes.toString());
        if (proposal.docType !== 'fundingProposal') {
            throw new Error(`The record ${id} is not a funding proposal.`);
        }
        return JSON.stringify(proposal);
    }

    async VoteFundingProposal(ctx, id, vote) {
        if (vote !== 'APPROVE' && vote !== 'REJECT') {
            throw new Error(`Vote must be APPROVE or REJECT. Received: ${vote}`);
        }

        const orgId = this._authorize(ctx);

        const proposalBytes = await ctx.stub.getState(id);
        if (!proposalBytes || proposalBytes.length === 0) {
            throw new Error(`The funding proposal ${id} does not exist.`);
        }
        const proposal = JSON.parse(proposalBytes.toString());
        if (proposal.docType !== 'fundingProposal') {
            throw new Error(`The record ${id} is not a funding proposal.`);
        }

        if (proposal.status !== 'Pending') {
            throw new Error(`Funding Proposal ${id} is already ${proposal.status}.`);
        }

        proposal.votedOrgs = proposal.votedOrgs || [];
        proposal.voteDetails = proposal.voteDetails || {};

        if (proposal.votedOrgs.includes(orgId)) {
            throw new Error(`Organization ${orgId} has already voted on funding proposal ${id}.`);
        }

        proposal.votedOrgs.push(orgId);
        proposal.voteDetails[orgId] = {
            vote: vote,
            timestamp: this._getTxTimestampIso(ctx),
            txId: ctx.stub.getTxID()
        };

        if (vote === 'REJECT') {
            proposal.status = 'Rejected';
            await this._createAuditLog(ctx, 'FUNDING_PROPOSAL_REJECTED', id, `Funding proposal rejected by ${orgId}`);
            const eventPayload = {
                id: id,
                status: 'Rejected',
                organization: orgId,
                transactionId: ctx.stub.getTxID(),
                timestamp: this._getTxTimestampIso(ctx)
            };
            ctx.stub.setEvent('FundingProposalRejected', Buffer.from(JSON.stringify(eventPayload)));
        } else {
            proposal.votes += 1;
            if (proposal.votes >= REQUIRED_APPROVALS) {
                proposal.status = 'Approved';
                proposal.approved = true;
                await this._createAuditLog(ctx, 'FUNDING_PROPOSAL_APPROVED', id, `Funding proposal reached ${REQUIRED_APPROVALS}/${REQUIRED_APPROVALS} approvals`);
                const eventPayload = {
                    id: id,
                    status: 'Approved',
                    transactionId: ctx.stub.getTxID(),
                    timestamp: this._getTxTimestampIso(ctx)
                };
                ctx.stub.setEvent('FundingProposalApproved', Buffer.from(JSON.stringify(eventPayload)));
            }
        }

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(proposal)));
        await this._createAuditLog(ctx, 'FUNDING_VOTE_CAST', id, `Vote ${vote} cast by ${orgId}`);
        return JSON.stringify(proposal);
    }

    async ConfirmFunding(ctx, fundingId, confirmedBy) {
        const orgId = this._authorize(ctx, ['FinanceMSP']);

        const proposalBytes = await ctx.stub.getState(fundingId);
        if (!proposalBytes || proposalBytes.length === 0) {
            throw new Error(`The funding proposal ${fundingId} does not exist.`);
        }
        const proposal = JSON.parse(proposalBytes.toString());
        if (proposal.docType !== 'fundingProposal') {
            throw new Error(`The record ${fundingId} is not a funding proposal.`);
        }

        if (proposal.status !== 'Approved') {
            throw new Error(`Funding Proposal ${fundingId} is in ${proposal.status} state. Only Approved proposals can be confirmed.`);
        }

        if (proposal.confirmed === true || proposal.status === 'Confirmed') {
            throw new Error(`Funding Proposal ${fundingId} has already been confirmed.`);
        }

        // Increase the treasury reserve by the funding amount
        const reserveBytes = await ctx.stub.getState('TreasuryReserve');
        if (!reserveBytes || reserveBytes.length === 0) {
            throw new Error('TreasuryReserve does not exist.');
        }
        const reserve = JSON.parse(reserveBytes.toString('utf8'));
        
        reserve.balance += proposal.amount;
        await ctx.stub.putState('TreasuryReserve', Buffer.from(JSON.stringify(reserve)));
        await this._createAuditLog(ctx, 'RESERVE_ADDITION', fundingId, `Added ${proposal.amount} to reserve. New balance: ${reserve.balance}`);

        // Update proposal status
        proposal.status = 'Confirmed';
        proposal.confirmed = true;
        proposal.confirmedBy = confirmedBy;
        proposal.confirmedAt = this._getTxTimestampIso(ctx);

        await ctx.stub.putState(fundingId, Buffer.from(JSON.stringify(proposal)));
        await this._createAuditLog(ctx, 'FUNDING_PROPOSAL_CONFIRMED', fundingId, `Funding proposal confirmed by ${confirmedBy}`);

        const eventPayload = {
            id: fundingId,
            status: 'Confirmed',
            amount: proposal.amount,
            confirmedBy: confirmedBy,
            transactionId: ctx.stub.getTxID(),
            timestamp: proposal.confirmedAt
        };
        ctx.stub.setEvent('FundingConfirmed', Buffer.from(JSON.stringify(eventPayload)));

        return JSON.stringify(proposal);
    }

    async GetPendingFundingProposals(ctx) {
        return this._getFundingProposalsByStatus(ctx, 'Pending');
    }

    async GetApprovedFundingProposals(ctx) {
        return this._getFundingProposalsByStatus(ctx, 'Approved');
    }

    async GetRejectedFundingProposals(ctx) {
        return this._getFundingProposalsByStatus(ctx, 'Rejected');
    }

    async _getFundingProposalsByStatus(ctx, status) {
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
            if (record.docType === 'fundingProposal' && record.status === status) {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }

    async GetAllFundingProposals(ctx) {
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
                continue;
            }
            if (record.docType === 'fundingProposal') {
                allResults.push({ Key: key, Record: record });
            }
        }
        return JSON.stringify(allResults);
    }
}

module.exports = TreasuryContract;
