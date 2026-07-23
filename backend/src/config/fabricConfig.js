const path = require('path');
require('dotenv').config();

// Resolve paths relative to the backend root directory (two levels up from this file)
const connectionProfilePath = path.resolve(__dirname, '../../', process.env.CONNECTION_PROFILE);
const walletPath = path.resolve(__dirname, '../../', process.env.WALLET_PATH);

const fabricConfig = {
    mspId: process.env.MSP_ID,
    identity: process.env.IDENTITY,
    channelName: process.env.CHANNEL_NAME,
    chaincodeName: process.env.CHAINCODE_NAME,
    connectionProfile: connectionProfilePath,
    walletPath: walletPath
};

module.exports = fabricConfig;
