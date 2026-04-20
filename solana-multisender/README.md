# Solana Multisender Deployment Package

This folder contains everything needed to build and deploy a Solana multisender program using Anchor.

## Prerequisites

1. Install Rust + Cargo
2. Install Solana CLI
3. Install Anchor CLI
4. Install Node.js (18+) and Yarn

## Setup

```bash
cd solana-multisender
yarn install
solana config set --url localhost
solana-keygen new --outfile ~/.config/solana/id.json
```

## Build

```bash
anchor build
```

## Deploy

```bash
anchor deploy
```

or run helper script:

```bash
./scripts/deploy-localnet.sh
```

## Test

```bash
anchor test
```

## Program behavior

The `multisend` instruction transfers SPL tokens from a signer-owned source token account to a destination token account.
For true batch multisend, call this instruction repeatedly in one or more transactions from the client.
