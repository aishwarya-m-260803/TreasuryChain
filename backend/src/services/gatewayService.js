const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const fabricConfig = require('../config/fabricConfig');

// Connection cache: mapping mspId -> { gateway, network, contract }
const connections = {};

/**
 * Creates a new gRPC connection to the peer for the specified org.
 * In this implementation, we use the Finance peer's connection profile for all orgs,
 * because all orgs are on the same channel and the peer will accept evaluate/submit calls
 * from any enrolled identity.
 */
async function newGrpcConnection(orgFabricConfig) {
    // Read the connection profile from the environment (defaulting to Finance profile)
    const profileContent = await fs.readFile(fabricConfig.connectionProfile, 'utf8');
    const profile = JSON.parse(profileContent);

    // We'll use the finance peer as the gateway for all organizations in this demo
    const peerName = 'peer0.finance.treasurychain.com';
    const peer = profile.peers[peerName];
    let tlsRootCert;
    if (Array.isArray(peer.tlsCACerts.pem)) {
        tlsRootCert = peer.tlsCACerts.pem[0];
    } else {
        tlsRootCert = peer.tlsCACerts.pem;
    }

    const peerUrl = peer.url.replace(/^grpc(s)?:\/\//, '');
    
    const tlsCredentials = grpc.credentials.createSsl(Buffer.from(tlsRootCert));
    const grpcClient = new grpc.Client(peerUrl, tlsCredentials, {
        'grpc.ssl_target_name_override': peer.grpcOptions['ssl-target-name-override']
    });
    
    return grpcClient;
}

/**
 * Loads the user's certificate from their specific MSP directory.
 */
async function newIdentity(orgFabricConfig) {
    const signcertsPath = path.join(orgFabricConfig.mspPath, 'signcerts');
    const files = await fs.readdir(signcertsPath);
    const certPath = path.join(signcertsPath, files.find(file => file.endsWith('.pem')));
    
    const credentials = await fs.readFile(certPath);
    return { mspId: orgFabricConfig.mspId, credentials };
}

/**
 * Loads the user's private key from their specific MSP directory.
 */
async function newSigner(orgFabricConfig) {
    const keystorePath = path.join(orgFabricConfig.mspPath, 'keystore');
    const files = await fs.readdir(keystorePath);
    const keyPath = path.join(keystorePath, files.find(file => file.endsWith('_sk')));
    
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * Gets or creates a Fabric contract connection for the specific organization.
 */
async function getContractForOrg(orgFabricConfig) {
    const { mspId } = orgFabricConfig;
    
    if (connections[mspId]) {
        return connections[mspId];
    }

    const client = await newGrpcConnection(orgFabricConfig);
    const identity = await newIdentity(orgFabricConfig);
    const signer = await newSigner(orgFabricConfig);

    const gateway = connect({
        client,
        identity,
        signer,
    });
    console.log(`✅ Connected to Fabric Gateway as ${mspId}`);

    const network = gateway.getNetwork(fabricConfig.channelName);
    const contract = network.getContract(fabricConfig.chaincodeName);

    const connectionInfo = { gateway, network, contract };
    connections[mspId] = connectionInfo;

    return connectionInfo;
}

module.exports = { getContractForOrg };
