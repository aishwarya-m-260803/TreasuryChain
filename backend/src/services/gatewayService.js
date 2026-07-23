const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const fabricConfig = require('../config/fabricConfig');

// Resolves the absolute path to the MSP directory where the generated keys and certificates reside.
const mspDirPath = path.resolve(
    __dirname,
    '../../../network/organizations/peerOrganizations/finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp'
);

// Singleton instances to reuse the connection
let gatewayInstance;
let networkInstance;
let contractInstance;

async function newGrpcConnection() {
    const profileContent = await fs.readFile(fabricConfig.connectionProfile, 'utf8');
    const profile = JSON.parse(profileContent);
    console.log('✅ Connection profile loaded');

    // Extract the peer details dynamically
    const peerName = 'peer0.finance.treasurychain.com';
    const peer = profile.peers[peerName];
    let tlsRootCert;
    if (Array.isArray(peer.tlsCACerts.pem)) {
        tlsRootCert = peer.tlsCACerts.pem[0];
    } else {
        tlsRootCert = peer.tlsCACerts.pem;
    }

    // gRPC requires the host:port string without the grpcs:// protocol prefix
    const peerUrl = peer.url.replace(/^grpc(s)?:\/\//, '');
    
    const tlsCredentials = grpc.credentials.createSsl(Buffer.from(tlsRootCert));
    const grpcClient = new grpc.Client(peerUrl, tlsCredentials, {
        'grpc.ssl_target_name_override': peer.grpcOptions['ssl-target-name-override']
    });
    
    console.log('✅ gRPC connection established');
    return grpcClient;
}

async function newIdentity() {
    const signcertsPath = path.join(mspDirPath, 'signcerts');
    const files = await fs.readdir(signcertsPath);
    const certPath = path.join(signcertsPath, files.find(file => file.endsWith('.pem')));
    
    const credentials = await fs.readFile(certPath);
    console.log('✅ Admin certificate loaded');
    return { mspId: fabricConfig.mspId, credentials };
}

async function newSigner() {
    const keystorePath = path.join(mspDirPath, 'keystore');
    const files = await fs.readdir(keystorePath);
    const keyPath = path.join(keystorePath, files.find(file => file.endsWith('_sk')));
    
    const privateKeyPem = await fs.readFile(keyPath);
    console.log('✅ Private key loaded');
    
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

async function getContract() {
    if (contractInstance) {
        return { gateway: gatewayInstance, network: networkInstance, contract: contractInstance };
    }

    const client = await newGrpcConnection();
    const identity = await newIdentity();
    const signer = await newSigner();

    gatewayInstance = connect({
        client,
        identity,
        signer,
    });
    console.log('✅ Connected to Fabric Gateway');

    networkInstance = gatewayInstance.getNetwork(fabricConfig.channelName);
    console.log(`✅ Connected to channel: ${fabricConfig.channelName}`);

    contractInstance = networkInstance.getContract(fabricConfig.chaincodeName);
    console.log(`✅ Connected to chaincode: ${fabricConfig.chaincodeName}`);

    return { gateway: gatewayInstance, network: networkInstance, contract: contractInstance };
}

module.exports = { getContract };
