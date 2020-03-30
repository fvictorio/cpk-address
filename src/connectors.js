import { Connectors } from 'web3-react'
const { InjectedConnector, NetworkOnlyConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })

const Infura = new NetworkOnlyConnector({
  providerURL: 'https://rinkeby.infura.io/v3/76fb6c10f1584483a45a0a28e91b07ad'
})

export const connectors = { Infura, MetaMask }
