const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const NETWORKS = {
  1: {
    key: "ethereum",
    name: "Ethereum",
    chainIdHex: "0x1",
    rpcUrls: ["https://rpc.ankr.com/eth"],
    blockExplorerUrls: ["https://etherscan.io"],
    multisenderAddress: ZERO_ADDRESS
  },
  56: {
    key: "bsc",
    name: "BNB Smart Chain",
    chainIdHex: "0x38",
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
    multisenderAddress: ZERO_ADDRESS
  },
  137: {
    key: "polygon",
    name: "Polygon",
    chainIdHex: "0x89",
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    multisenderAddress: ZERO_ADDRESS
  },
  250: {
    key: "fantom",
    name: "Fantom",
    chainIdHex: "0xfa",
    rpcUrls: ["https://rpcapi.fantom.network"],
    blockExplorerUrls: ["https://ftmscan.com"],
    multisenderAddress: "0xE29F753b031B2ff6073583bA74bD5ddD73E9fe50"
  },
  42161: {
    key: "arbitrum",
    name: "Arbitrum One",
    chainIdHex: "0xa4b1",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
    multisenderAddress: ZERO_ADDRESS
  },
  10: {
    key: "optimism",
    name: "Optimism",
    chainIdHex: "0xa",
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
    multisenderAddress: ZERO_ADDRESS
  },
  8453: {
    key: "base",
    name: "Base",
    chainIdHex: "0x2105",
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
    multisenderAddress: ZERO_ADDRESS
  },
  43114: {
    key: "avalanche",
    name: "Avalanche C-Chain",
    chainIdHex: "0xa86a",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
    multisenderAddress: ZERO_ADDRESS
  }
}

let airdropContractAddress = NETWORKS[250].multisenderAddress;

function getSelectedChainId() {
  const selectedChainId = document.getElementById('networkSelect').value
  return Number(selectedChainId)
}

function updateMultisenderAddressInput(chainId){
  const network = NETWORKS[chainId]
  const input = document.getElementById('multisenderAddress')
  if (!network || !input) {
    return
  }
  input.value = network.multisenderAddress
  input.placeholder = network.multisenderAddress !== ZERO_ADDRESS
    ? network.multisenderAddress
    : "Enter deployed multisender contract address for this network"
}

function setAirdropContractFromInput() {
  if(!window.web3){
    alert('Please connect an EVM wallet (for example MetaMask) first.')
    return false
  }
  const input = document.getElementById('multisenderAddress')
  const value = (input.value || '').trim()
  if(!web3.utils.isAddress(value)){
    alert('Please provide a valid multisender contract address.')
    return false
  }
  airdropContractAddress = value
  window.airdropContract = new web3.eth.Contract(airdropAbi, airdropContractAddress)
  return true
}

async function switchNetwork(){
  const chainId = getSelectedChainId()
  const network = NETWORKS[chainId]
  if(!network || !window.ethereum){
    return
  }
  try{
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }]
    })
  } catch (switchError){
    if(switchError.code === 4902){
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainIdHex,
          chainName: network.name,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.blockExplorerUrls
        }]
      })
    } else {
      throw switchError
    }
  }
}

function onNetworkChanged(){
  const chainId = getSelectedChainId()
  updateMultisenderAddressInput(chainId)
}

setup()
function setup(){
  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log('interface starting modern')
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */});
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log('legacydapp')
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      console.log('No injected EVM wallet detected; EVM actions require MetaMask or another compatible wallet.')
    }
    document.getElementById('networkSelect').onchange = onNetworkChanged
    document.getElementById('distributionType').onchange = function(){
      if(typeof toggleDistributionUI === 'function'){
        toggleDistributionUI(this.value)
      }
    }
    document.getElementById('switchNetworkButton').onclick = async function(){
      try{
        await switchNetwork()
      } catch (e){
        alert('Unable to switch network in wallet. Please switch manually.')
      }
    }
    onNetworkChanged()
    if(typeof toggleDistributionUI === 'function'){
      toggleDistributionUI(document.getElementById('distributionType').value)
    }
    if(window.web3){
      setAirdropContractFromInput()
    }

    if(window.web3){
      web3.eth.net.getId().then(function(nid){
        window.netId=nid;
        console.log('netid ',window.netId)
      })
    }

    if(window.ethereum){
      window.ethereum.on('chainChanged', function(){
        window.location.reload()
      })
    }

    if(window.web3){
      window.airdropContract=new web3.eth.Contract(airdropAbi,airdropContractAddress)
    }
		window.main()
  });
}
