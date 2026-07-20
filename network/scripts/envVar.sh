#!/usr/bin/env bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
# test network home var targets to test-network folder
# the reason we use a var here is to accommodate scenarios
# where execution occurs from folders outside of default as $PWD, such as the test-network/addOrg3 folder.
# For setting environment variables, simple relative paths like ".." could lead to unintended references
# due to how they interact with FABRIC_CFG_PATH. It's advised to specify paths more explicitly,
# such as using "../${PWD}", to ensure that Fabric's environment variables are pointing to the correct paths.
TEST_NETWORK_HOME=${TEST_NETWORK_HOME:-${PWD}}
. ${TEST_NETWORK_HOME}/scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${TEST_NETWORK_HOME}/organizations/ordererOrganizations/orderer.treasurychain.com/tlsca/tlsca.orderer.treasurychain.com-cert.pem
export PEER0_FINANCE_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/finance.treasurychain.com/tlsca/tlsca.finance.treasurychain.com-cert.pem
export PEER0_TRUSTEE_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/trustee.treasurychain.com/tlsca/tlsca.trustee.treasurychain.com-cert.pem
export PEER0_OPERATIONS_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/operations.treasurychain.com/tlsca/tlsca.operations.treasurychain.com-cert.pem
export PEER0_AUDIT_CA=${TEST_NETWORK_HOME}/organizations/peerOrganizations/audit.treasurychain.com/tlsca/tlsca.audit.treasurychain.com-cert.pem

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID=FinanceMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_FINANCE_CA
    export CORE_PEER_MSPCONFIGPATH=${TEST_NETWORK_HOME}/organizations/peerOrganizations/finance.treasurychain.com/users/Admin@finance.treasurychain.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID=TrusteeMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_TRUSTEE_CA
    export CORE_PEER_MSPCONFIGPATH=${TEST_NETWORK_HOME}/organizations/peerOrganizations/trustee.treasurychain.com/users/Admin@trustee.treasurychain.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID=OperationsMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_OPERATIONS_CA
    export CORE_PEER_MSPCONFIGPATH=${TEST_NETWORK_HOME}/organizations/peerOrganizations/operations.treasurychain.com/users/Admin@operations.treasurychain.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  elif [ $USING_ORG -eq 4 ]; then
    export CORE_PEER_LOCALMSPID=AuditMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_AUDIT_CA
    export CORE_PEER_MSPCONFIGPATH=${TEST_NETWORK_HOME}/organizations/peerOrganizations/audit.treasurychain.com/users/Admin@audit.treasurychain.com/msp
    export CORE_PEER_ADDRESS=localhost:13051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" = "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    if [ $1 -eq 1 ]; then
      PEER="peer0.finance"
      CA=PEER0_FINANCE_CA
    elif [ $1 -eq 2 ]; then
      PEER="peer0.trustee"
      CA=PEER0_TRUSTEE_CA
    elif [ $1 -eq 3 ]; then
      PEER="peer0.operations"
      CA=PEER0_OPERATIONS_CA
    elif [ $1 -eq 4 ]; then
      PEER="peer0.audit"
      CA=PEER0_AUDIT_CA
    fi
    
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
