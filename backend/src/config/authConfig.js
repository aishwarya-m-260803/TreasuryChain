const path = require('path');
require('dotenv').config();

// Base paths for credentials
const baseNetworkPath = path.resolve(__dirname, '../../../network/organizations/peerOrganizations');

const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',

    // Static credential map for enterprise demo
    credentials: {
        'finance': {
            username: 'finance_admin',
            password: 'Finance@123',
            fabric: {
                mspId: 'FinanceMSP',
                userIdentity: 'Admin@finance.treasurychain.com',
                orgDomain: 'finance.treasurychain.com',
                peerName: 'peer0.finance.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp')
            }
        },
        'trustee': {
            username: 'trustee_admin',
            password: 'Trustee@123',
            fabric: {
                mspId: 'TrusteeMSP',
                userIdentity: 'Admin@trustee.treasurychain.com',
                orgDomain: 'trustee.treasurychain.com',
                peerName: 'peer0.trustee.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'trustee.treasurychain.com/users/Admin@trustee.treasurychain.com/msp')
            }
        },
        'audit': {
            username: 'audit_admin',
            password: 'Audit@123',
            fabric: {
                mspId: 'AuditMSP',
                userIdentity: 'Admin@audit.treasurychain.com',
                orgDomain: 'audit.treasurychain.com',
                peerName: 'peer0.audit.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'audit.treasurychain.com/users/Admin@audit.treasurychain.com/msp')
            }
        },
        'management': {
            username: 'management_admin',
            password: 'Management@123',
            fabric: {
                mspId: 'OperationsMSP',
                userIdentity: 'Admin@operations.treasurychain.com',
                orgDomain: 'operations.treasurychain.com',
                peerName: 'peer0.operations.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'operations.treasurychain.com/users/Admin@operations.treasurychain.com/msp')
            }
        }
    }
};

module.exports = authConfig;
