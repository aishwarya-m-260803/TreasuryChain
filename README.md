<div align="center">

# 💰 TreasuryChain

### Enterprise Treasury Management Platform built on Hyperledger Fabric

*A permissioned blockchain application that enables secure treasury operations through decentralized governance, immutable audit trails, and cryptographic document verification.*

![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger-Fabric-2F3134?style=for-the-badge)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/Chaincode-JavaScript-F7DF1E?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge)

</div>

---

## 📖 Overview

**TreasuryChain** is a full-stack blockchain application that digitizes enterprise treasury management using **Hyperledger Fabric**. The platform replaces traditional centralized approval systems with a permissioned blockchain network where financial operations are governed collectively by multiple organizations. Every proposal, approval, and treasury update is validated through smart contracts and permanently recorded on an immutable ledger, ensuring transparency, accountability, and trust.

---

## ✨ Key Features

### 🔹 Decentralized Treasury Governance
Implements a **one-vote-per-organization** approval workflow for expense and funding proposals, ensuring transparent decision-making and preventing duplicate or unauthorized votes.

### 🔹 Smart Contract Automation
Business logic is implemented using **JavaScript Chaincode**, automating proposal creation, voting, treasury balance updates, funding confirmation, and audit record generation.

### 🔹 Permissioned Blockchain Security
Leverages **Hyperledger Fabric**, **Fabric CA**, and **Membership Service Providers (MSPs)** to authenticate organizations and enforce secure organization-level authorization.

### 🔹 Full Stack Architecture
Built with a **React** frontend and **Node.js/Express** backend integrated with the **Hyperledger Fabric Gateway SDK**, providing a seamless interface for interacting with blockchain smart contracts.

### 🔹 Immutable Audit Trail
Every financial transaction and approval is permanently recorded on the blockchain, enabling complete traceability, accountability, and tamper-proof auditing.

### 🔹 Document Integrity Verification
Supporting documents remain off-chain while their **SHA-256 cryptographic hashes** are stored on the ledger, allowing document authenticity to be verified without exposing sensitive files.

---

## 🏗️ System Architecture

```text
                    React Frontend
                           │
                           ▼
                  Node.js / Express API
                           │
                           ▼
             Hyperledger Fabric Gateway SDK
                           │
                           ▼
               Hyperledger Fabric Network
      ┌─────────────┬──────────────┬─────────────┬─────────────┐
      │ Finance Org │ Operations   │ Trustee Org │ Audit Org   │
      │    Peer     │    Peer      │    Peer     │    Peer     │
      └─────────────┴──────────────┴─────────────┴─────────────┘
                           │
                           ▼
               JavaScript Smart Contracts
                           │
                           ▼
                World State & Blockchain Ledger
```

---

## ⚙️ Technology Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | React, Vite, JavaScript |
| **Backend** | Node.js, Express.js, Fabric Gateway SDK |
| **Blockchain** | Hyperledger Fabric, JavaScript Chaincode, Fabric CA, CouchDB |
| **Infrastructure** | Docker |
| **Security** | MSP, X.509 Certificates, SHA-256 Hashing |

---

## ⛓️ Blockchain Concepts Demonstrated

- Permissioned Blockchain Architecture
- Smart Contracts (Chaincode)
- Multi-Organization Governance
- Membership Service Providers (MSP)
- Fabric CA & X.509 Digital Certificates
- World State & Immutable Ledger
- Transaction Endorsement
- MVCC Conflict Detection
- Cryptographic Document Verification
- Immutable Audit Logging

---

## 🚀 Project Highlights

- Designed a **multi-organization treasury approval workflow** using Hyperledger Fabric.
- Built a complete **React + Node.js + Hyperledger Fabric** application.
- Implemented secure **expense and funding management** with blockchain-backed business logic.
- Integrated **SHA-256 document verification** to detect tampering without storing sensitive documents on-chain.
- Applied enterprise blockchain concepts including **MSP-based authorization**, **smart contracts**, **ledger auditing**, and **permissioned identity management**.

---

## 📁 Project Structure

```text
TreasuryChain/
├── chaincode/                 # Smart contracts implementing treasury business logic
├── backend/                   # Express API & Fabric Gateway integration
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── fabric/
├── frontend/                  # React application
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
├── network/                   # Hyperledger Fabric network configuration
├── docker/                    # Docker configuration
└── README.md
```

---

## 👩‍💻 Author

**Aishwarya M**

Passionate about building secure, scalable, and enterprise-grade applications using blockchain technologies, distributed systems, and modern full-stack development.

---

<div align="center">

⭐ **If you found this project interesting, consider giving it a star!**

Built with **Hyperledger Fabric**, **React**, **Node.js**, and **JavaScript** to demonstrate enterprise-grade treasury management on a permissioned blockchain.

</div>
