const ZERO_ADDRESS = window.EVM_ZERO_ADDRESS || '0x0000000000000000000000000000000000000000'
const NETWORKS = window.EVM_NETWORKS || {}
const NETWORK_LIST = window.EVM_NETWORK_LIST || []
const DEFAULT_CHAIN_ID = window.DEFAULT_EVM_CHAIN_ID || 250

const WALLETCONNECT_PROJECT_ID_KEY = 'walletconnectProjectId'
const LAST_CONNECTOR_KEY = 'lastEvmConnector'

let airdropContractAddress = (NETWORKS[DEFAULT_CHAIN_ID] || {}).multisenderAddress || ZERO_ADDRESS
let activeProvider = null
let activeConnector = null
let walletConnectProvider = null

function getSelectedChainId() {
  const selectedChainId = document.getElementById('networkSelect').value
  return Number(selectedChainId)
}

function populateNetworkSelect(){
  const networkSelect = document.getElementById('networkSelect')
  if(!networkSelect){
    return
  }

  networkSelect.innerHTML = ''
  NETWORK_LIST.forEach(function(network){
    const option = document.createElement('option')
    option.value = String(network.chainId)
    option.textContent = network.name
    if(network.chainId === DEFAULT_CHAIN_ID){
      option.selected = true
    }
    networkSelect.appendChild(option)
  })
}

function getWalletConnectProjectId(){
  const input = document.getElementById('walletConnectProjectId')
  if (!input) {
    return ''
  }
  return (input.value || '').trim()
}

function persistWalletConnectProjectId(){
  const projectId = getWalletConnectProjectId()
  if(projectId){
    window.localStorage.setItem(WALLETCONNECT_PROJECT_ID_KEY, projectId)
  }
}

function updateConnectionStatus(message){
  const statusElement = document.getElementById('evmConnectionStatus')
  if(statusElement){
    statusElement.textContent = message
  }
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
    : 'Enter deployed multisender contract address for this network'
}

function setAirdropContractFromInput() {
  if(!window.web3){
    alert('Please connect an EVM wallet first.')
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

function getWalletConnectFactory(){
  const wcNamespace = window['@walletconnect/ethereum-provider']
  if(!wcNamespace){
    return null
  }
  return wcNamespace.EthereumProvider || wcNamespace.default || wcNamespace
}

function removeProviderListeners(provider){
  if(!provider || typeof provider.removeListener !== 'function'){
    return
  }
  provider.removeListener('accountsChanged', handleAccountsChanged)
  provider.removeListener('chainChanged', handleChainChanged)
  provider.removeListener('disconnect', handleProviderDisconnect)
}

function attachProviderListeners(provider){
  if(!provider || typeof provider.on !== 'function'){
    return
  }
  provider.on('accountsChanged', handleAccountsChanged)
  provider.on('chainChanged', handleChainChanged)
  provider.on('disconnect', handleProviderDisconnect)
}

function normalizeChainId(chainIdValue){
  if(typeof chainIdValue === 'string'){
    return chainIdValue.startsWith('0x') ? parseInt(chainIdValue, 16) : Number(chainIdValue)
  }
  return Number(chainIdValue)
}

async function handleAccountsChanged(accounts){
  if(!accounts || accounts.length === 0){
    updateConnectionStatus('Wallet: Connected but no account selected')
    return
  }
  const selectedChainId = await getCurrentChainId()
  const network = NETWORKS[selectedChainId]
  const shortAccount = accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4)
  updateConnectionStatus('Wallet: ' + shortAccount + ' via ' + activeConnector + (network ? ' on ' + network.name : ''))
}

function handleChainChanged(chainIdValue){
  const chainId = normalizeChainId(chainIdValue)
  const network = NETWORKS[chainId]
  if(network){
    const networkSelect = document.getElementById('networkSelect')
    if(networkSelect){
      networkSelect.value = String(chainId)
    }
    onNetworkChanged()
  }
}

function handleProviderDisconnect(){
  cleanupConnectorState()
  updateConnectionStatus('Wallet: Disconnected')
}

async function getCurrentChainId(){
  if(!activeProvider || !activeProvider.request){
    return null
  }
  const rawChainId = await activeProvider.request({ method: 'eth_chainId' })
  return normalizeChainId(rawChainId)
}

async function setActiveProvider(provider, connectorName){
  removeProviderListeners(activeProvider)
  activeProvider = provider
  activeConnector = connectorName
  window.ethereum = provider
  window.web3 = new Web3(provider)
  attachProviderListeners(provider)
  window.localStorage.setItem(LAST_CONNECTOR_KEY, connectorName)

  const accounts = await provider.request({ method: 'eth_accounts' })
  await handleAccountsChanged(accounts)

  if(!setAirdropContractFromInput()){
    updateMultisenderAddressInput(getSelectedChainId())
    setAirdropContractFromInput()
  }
}

function cleanupConnectorState(){
  removeProviderListeners(activeProvider)
  activeProvider = null
  activeConnector = null
  window.web3 = null
  window.ethereum = null
  window.localStorage.removeItem(LAST_CONNECTOR_KEY)
}

async function connectInjectedWallet(){
  if(!window.ethereum){
    alert('No injected wallet found. Install MetaMask, Rabby, or another EIP-1193 wallet.')
    return
  }
  const injectedProvider = window.ethereum
  await injectedProvider.request({ method: 'eth_requestAccounts' })
  await setActiveProvider(injectedProvider, 'Injected wallet')
}

async function connectWalletConnect(){
  const EthereumProviderFactory = getWalletConnectFactory()
  if(!EthereumProviderFactory){
    alert('WalletConnect provider library failed to load. Refresh the page and try again.')
    return
  }
  const projectId = getWalletConnectProjectId()
  if(!projectId){
    alert('Please enter your Reown / WalletConnect Project ID before connecting WalletConnect.')
    return
  }
  persistWalletConnectProjectId()

  const chainId = getSelectedChainId()
  if(!walletConnectProvider){
    walletConnectProvider = await EthereumProviderFactory.init({
      projectId: projectId,
      chains: [chainId],
      optionalChains: Object.keys(NETWORKS).map(Number),
      showQrModal: true,
      methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
      optionalMethods: ['wallet_switchEthereumChain', 'wallet_addEthereumChain'],
      metadata: {
        name: 'Fantom Multisender ERC20',
        description: 'Batch EVM token and native distributions',
        url: window.location.origin,
        icons: [window.location.origin + '/img/favicon.png']
      }
    })
  }

  await walletConnectProvider.connect()
  await setActiveProvider(walletConnectProvider, 'WalletConnect')
}

async function disconnectWallet(){
  if(activeConnector === 'WalletConnect' && walletConnectProvider){
    await walletConnectProvider.disconnect()
  }
  cleanupConnectorState()
  updateConnectionStatus('Wallet: Not connected')
}

async function switchNetwork(){
  const chainId = getSelectedChainId()
  const network = NETWORKS[chainId]
  if(!network || !activeProvider){
    alert('Please connect your wallet first.')
    return
  }
  try{
    await activeProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }]
    })
  } catch (switchError){
    if(switchError.code === 4902){
      await activeProvider.request({
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
    const projectIdInput = document.getElementById('walletConnectProjectId')
    if(projectIdInput){
      projectIdInput.value = window.localStorage.getItem(WALLETCONNECT_PROJECT_ID_KEY) || ''
      projectIdInput.addEventListener('change', persistWalletConnectProjectId)
      projectIdInput.addEventListener('blur', persistWalletConnectProjectId)
    }

    populateNetworkSelect()

    document.getElementById('connectInjectedButton').onclick = async function(){
      try{
        await connectInjectedWallet()
      } catch (error){
        alert('Unable to connect injected wallet. ' + (error.message || ''))
      }
    }

    document.getElementById('connectWalletConnectButton').onclick = async function(){
      try{
        await connectWalletConnect()
      } catch (error){
        alert('Unable to connect WalletConnect. ' + (error.message || ''))
      }
    }

    document.getElementById('disconnectWalletButton').onclick = async function(){
      try{
        await disconnectWallet()
      } catch (error){
        alert('Unable to disconnect wallet. ' + (error.message || ''))
      }
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

    updateConnectionStatus('Wallet: Not connected')

    if(window.ethereum){
      try{
        const lastConnector = window.localStorage.getItem(LAST_CONNECTOR_KEY)
        if(lastConnector === 'Injected wallet'){
          await connectInjectedWallet()
        }
      } catch (error){
        console.log('Injected reconnect skipped', error)
      }
    }

    window.main()
  });
}
