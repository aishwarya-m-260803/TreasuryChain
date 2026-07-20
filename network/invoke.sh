#!/bin/bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="FinanceMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/finance.treasurychain.com/peers/peer0.finance.treasurychain.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.treasurychain.com --tls --cafile ${PWD}/organizations/ordererOrganizations/orderer.treasurychain.com/orderers/orderer.treasurychain.com/msp/tlscacerts/tlsca.orderer.treasurychain.com-cert.pem -C mychannel -n treasury \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/finance.treasurychain.com/peers/peer0.finance.treasurychain.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/trustee.treasurychain.com/peers/peer0.trustee.treasurychain.com/tls/ca.crt \
--peerAddresses localhost:11051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/operations.treasurychain.com/peers/peer0.operations.treasurychain.com/tls/ca.crt \
--peerAddresses localhost:13051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/audit.treasurychain.com/peers/peer0.audit.treasurychain.com/tls/ca.crt \
-c '{"function":"InitLedger","Args":[]}'
