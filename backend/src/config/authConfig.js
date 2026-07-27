const path = require('path');
require('dotenv').config();

// Base paths for credentials
const baseNetworkPath = path.resolve(__dirname, '../../../network/organizations/peerOrganizations');

const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',

    // Static credential map for enterprise demo
    // Keyed by "org_role" to support multiple accounts per organization
    credentials: {
        'finance_admin': {
            organization: 'finance',
            username: 'finance_admin',
            password: 'Finance@123',
            role: 'admin',
            fabric: {
                mspId: 'FinanceMSP',
                userIdentity: 'Admin@finance.treasurychain.com',
                orgDomain: 'finance.treasurychain.com',
                peerName: 'peer0.finance.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp')
            }
        },
        'finance_user': {
            organization: 'finance',
            username: 'finance_user',
            password: 'Finance@456',
            role: 'user',
            fabric: {
                mspId: 'FinanceMSP',
                userIdentity: 'User1@finance.treasurychain.com',
                orgDomain: 'finance.treasurychain.com',
                peerName: 'peer0.finance.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'finance.treasurychain.com/users/User1@finance.treasurychain.com/msp')
            }
        },
        'trustee_admin': {
            organization: 'trustee',
            username: 'trustee_admin',
            password: 'Trustee@123',
            role: 'admin',
            fabric: {
                mspId: 'TrusteeMSP',
                userIdentity: 'Admin@trustee.treasurychain.com',
                orgDomain: 'trustee.treasurychain.com',
                peerName: 'peer0.trustee.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'trustee.treasurychain.com/users/Admin@trustee.treasurychain.com/msp')
            }
        },
        'trustee_user': {
            organization: 'trustee',
            username: 'trustee_user',
            password: 'Trustee@456',
            role: 'user',
            fabric: {
                mspId: 'TrusteeMSP',
                userIdentity: 'User1@trustee.treasurychain.com',
                orgDomain: 'trustee.treasurychain.com',
                peerName: 'peer0.trustee.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'trustee.treasurychain.com/users/User1@trustee.treasurychain.com/msp')
            }
        },
        'audit_admin': {
            organization: 'audit',
            username: 'audit_admin',
            password: 'Audit@123',
            role: 'admin',
            fabric: {
                mspId: 'AuditMSP',
                userIdentity: 'Admin@audit.treasurychain.com',
                orgDomain: 'audit.treasurychain.com',
                peerName: 'peer0.audit.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'audit.treasurychain.com/users/Admin@audit.treasurychain.com/msp')
            }
        },
        'audit_user': {
            organization: 'audit',
            username: 'audit_user',
            password: 'Audit@456',
            role: 'user',
            fabric: {
                mspId: 'AuditMSP',
                userIdentity: 'User1@audit.treasurychain.com',
                orgDomain: 'audit.treasurychain.com',
                peerName: 'peer0.audit.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'audit.treasurychain.com/users/User1@audit.treasurychain.com/msp')
            }
        },
        'management_admin': {
            organization: 'management',
            username: 'management_admin',
            password: 'Management@123',
            role: 'admin',
            fabric: {
                mspId: 'OperationsMSP',
                userIdentity: 'Admin@operations.treasurychain.com',
                orgDomain: 'operations.treasurychain.com',
                peerName: 'peer0.operations.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'operations.treasurychain.com/users/Admin@operations.treasurychain.com/msp')
            }
        },
        'management_user': {
            organization: 'management',
            username: 'management_user',
            password: 'Management@456',
            role: 'user',
            fabric: {
                mspId: 'OperationsMSP',
                userIdentity: 'User1@operations.treasurychain.com',
                orgDomain: 'operations.treasurychain.com',
                peerName: 'peer0.operations.treasurychain.com',
                mspPath: path.join(baseNetworkPath, 'operations.treasurychain.com/users/User1@operations.treasurychain.com/msp')
            }
        }
    }
};

module.exports = authConfig;
