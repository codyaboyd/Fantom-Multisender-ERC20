# Fantom Multisender (ERC-20)

A lightweight web app for sending **ERC-20 tokens to multiple recipients in one workflow**.  
This project is designed for token distributions such as airdrops, rewards, and batch payouts on EVM-compatible networks.

## What this project does

- Connects to a Web3 wallet in the browser (for example, MetaMask).
- Lets you prepare a list of recipient addresses and token amounts.
- Submits a batch-style token distribution transaction through the app UI.

> This repository is a static frontend. You can serve it locally and interact with deployed contracts from your wallet.

## Features

- Simple browser-based UI
- ERC-20 multisend workflow
- Works with common EVM wallets
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
- A browser wallet extension (e.g. MetaMask)
- Native gas token on your selected network for transaction fees
- ERC-20 token balance and allowance as required by the multisend flow

## Project structure

- `index.html` – main application page
- `interface.js`, `main.js` – primary app logic
- `abi.js` – contract ABI definitions
- `js/`, `css/`, `img/`, `fonts/` – assets and supporting scripts/styles

## Notes and safety

- **Always test with a small amount first** before running large distributions.
- Verify recipient lists carefully; blockchain transactions are irreversible.
- Confirm network/chain selection in your wallet before submitting transactions.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
