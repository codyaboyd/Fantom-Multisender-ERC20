(function initEvmNetworks(global){
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  const EVM_NETWORK_LIST = [
    {
      chainId: 1,
      key: 'ethereum',
      name: 'Ethereum',
      rpcUrls: ['https://rpc.ankr.com/eth'],
      blockExplorerUrls: ['https://etherscan.io']
    },
    {
      chainId: 56,
      key: 'bsc',
      name: 'BNB Smart Chain',
      rpcUrls: ['https://bsc-dataseed.binance.org'],
      blockExplorerUrls: ['https://bscscan.com']
    },
    {
      chainId: 137,
      key: 'polygon',
      name: 'Polygon',
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com']
    },
    {
      chainId: 250,
      key: 'fantom',
      name: 'Fantom',
      rpcUrls: ['https://rpcapi.fantom.network'],
      blockExplorerUrls: ['https://ftmscan.com'],
      multisenderAddress: '0xE29F753b031B2ff6073583bA74bD5ddD73E9fe50',
      isDefault: true
    },
    {
      chainId: 42161,
      key: 'arbitrum',
      name: 'Arbitrum One',
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io']
    },
    {
      chainId: 10,
      key: 'optimism',
      name: 'Optimism',
      rpcUrls: ['https://mainnet.optimism.io'],
      blockExplorerUrls: ['https://optimistic.etherscan.io']
    },
    {
      chainId: 8453,
      key: 'base',
      name: 'Base',
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org']
    },
    {
      chainId: 43114,
      key: 'avalanche',
      name: 'Avalanche C-Chain',
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io']
    }
  ]

  function chainIdToHex(chainId){
    return '0x' + Number(chainId).toString(16)
  }

  function normalizeNetwork(network){
    return {
      chainId: Number(network.chainId),
      chainIdHex: network.chainIdHex || chainIdToHex(network.chainId),
      key: network.key,
      name: network.name,
      rpcUrls: Array.isArray(network.rpcUrls) ? network.rpcUrls : [],
      blockExplorerUrls: Array.isArray(network.blockExplorerUrls) ? network.blockExplorerUrls : [],
      multisenderAddress: network.multisenderAddress || ZERO_ADDRESS,
      isDefault: Boolean(network.isDefault)
    }
  }

  const normalizedList = EVM_NETWORK_LIST.map(normalizeNetwork)
  const byChainId = normalizedList.reduce(function(acc, network){
    acc[network.chainId] = network
    return acc
  }, {})

  const defaultNetwork = normalizedList.find(function(network){
    return network.isDefault
  }) || normalizedList[0]

  global.EVM_ZERO_ADDRESS = ZERO_ADDRESS
  global.EVM_NETWORK_LIST = normalizedList
  global.EVM_NETWORKS = byChainId
  global.DEFAULT_EVM_CHAIN_ID = defaultNetwork ? defaultNetwork.chainId : null
})(window)
