#!/bin/bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="FinanceMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/finance.treasurychain.com/peers/peer0.finance.treasurychain.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode query -C mychannel -n treasury -c '{"function":"QueryReserve","Args":[]}'
