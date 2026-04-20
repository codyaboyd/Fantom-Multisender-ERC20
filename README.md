# MultiSend EVM + Solana (Batch Native & Token Transfers)

A lightweight web app for sending **ERC-20 tokens, EVM native gas coins, SOL, and SPL tokens** to multiple recipients.  
This project is designed for token distributions such as airdrops, rewards, and batch payouts on Ethereum, BNB Smart Chain, Polygon, Fantom, Arbitrum, Optimism, Base, Avalanche, and Solana.

## What this project does

- Connects to a Web3 wallet in the browser (for example, MetaMask).
- Lets you prepare a list of recipient addresses and token/native amounts.
- Supports ERC-20 weighted distributions through a multisender contract flow.
- Supports EVM native coin distributions by sending wallet transactions per recipient.
- Supports SOL distributions through wallet-signed transfers.
- Supports SPL token distributions by sending token program transfers to recipient associated token accounts.

> This repository is a static frontend. You can serve it locally and interact with deployed contracts from your wallet.

## Features

- Simple browser-based UI
- ERC-20 multisend workflow
- EVM native coin multisend workflow (ETH/BNB/MATIC/FTM/AVAX and other EVM native coins)
- Solana SOL multisend workflow
- Solana SPL token multisend workflow
- Network selector for major EVM chains + Solana cluster selector
- Wallet network switch helper (`wallet_switchEthereumChain`)
- Configurable multisender contract address per selected chain
- Static files only (easy to host on any web server)

## Quick start

### 1) Clone the repository

```bash
git clone https://github.com/<your-org>/Fantom-Multisender-ERC20.git
cd Fantom-Multisender-ERC20
```

### 2) Serve the app locally

You can use any static server. One option:

```bash
npx http-server
```

Then open the local URL shown in your terminal (commonly `http://127.0.0.1:8080`).

## Requirements

- Node.js (only needed if you use `npx http-server`)
- Browser wallet extension(s): MetaMask (EVM) and Phantom (Solana)
- Native gas token on your selected network for transaction fees
- ERC-20 token balance and allowance as required by the multisend flow

## Project structure

- `index.html` – main application page
- `networks.js` – centralized EVM network registry (chain IDs, RPCs, explorers, default multisender addresses)
- `interface.js`, `main.js` – primary app logic for EVM + Solana modes
- `abi.js` – contract ABI definitions
- `js/`, `css/`, `img/`, `fonts/` – assets and supporting scripts/styles

## Adding a new EVM network

Network configuration is centralized in `networks.js` so expanding to new chains requires only one edit.

1. Open `networks.js` and add a new object in `EVM_NETWORK_LIST` with:
   - `chainId` (number)
   - `key` (short identifier)
   - `name` (display name)
   - `rpcUrls` (array)
   - `blockExplorerUrls` (array)
   - optional `multisenderAddress` (defaults to zero address when omitted)
2. (Optional) Set `isDefault: true` for the network that should be preselected in the UI.
3. Refresh the app. The network dropdown and wallet switch flow are generated from this list automatically.

## Notes and safety

- **Always test with a small amount first** before running large distributions.
- Verify recipient lists carefully; blockchain transactions are irreversible.
- Confirm network/chain selection in your wallet before submitting transactions.
- Ensure the multisender contract address is correct for the selected chain before approving tokens.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
