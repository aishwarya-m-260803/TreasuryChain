const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, 'network', 'organizations', 'peerOrganizations', 'finance.treasurychain.com', 'connection-finance.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(__dirname, 'backend', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('Admin@finance.treasurychain.com');
        if (!identity) {
            console.log('An identity for the admin user does not exist in the wallet');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Admin@finance.treasurychain.com', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('treasury');

        console.log('\n--> Submit Transaction: CreateFundingProposal');
        const result = await contract.submitTransaction('CreateFundingProposal', '1000', 'FinanceMSP', 'Gov Grant', 'REF-001', 'Q3 Budget', 'For Q3 expenses');
        console.log(`*** Result: ${result.toString()}`);

        gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
