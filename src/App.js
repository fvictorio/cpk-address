import React, { useState } from 'react';
import { ethers, utils } from 'ethers'
import Web3Provider, { useWeb3Context } from 'web3-react'
import './App.css';
import { connectors } from './connectors'

const cpkFactoryAbi = [ 'function proxyCreationCode() public pure returns (bytes memory)', ]

const networks = {
  1: {
    masterCopyAddress: '0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F',
    proxyFactoryAddress: '0x0fB4340432e56c014fa96286de17222822a9281b',
    multiSendAddress: '0xB522a9f781924eD250A11C54105E51840B138AdD',
    fallbackHandlerAddress: '0x40A930851BD2e590Bd5A5C981b436de25742E980',
  },
  // rinkeby
  4: {
    masterCopyAddress: '0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F',
    proxyFactoryAddress: '0x336c19296d3989e9e0c2561ef21c964068657c38',
    multiSendAddress: '0xB522a9f781924eD250A11C54105E51840B138AdD',
    fallbackHandlerAddress: '0x40A930851BD2e590Bd5A5C981b436de25742E980',
  },
  5: {
    masterCopyAddress: '0xaE32496491b53841efb51829d6f886387708F99B',
    proxyFactoryAddress: '0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7',
    multiSendAddress: '0xB522a9f781924eD250A11C54105E51840B138AdD',
    fallbackHandlerAddress: '0x40A930851BD2e590Bd5A5C981b436de25742E980',
  },
  // kovan
  42: {
    masterCopyAddress: '0xaE32496491b53841efb51829d6f886387708F99B',
    proxyFactoryAddress: '0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7',
    multiSendAddress: '0xB522a9f781924eD250A11C54105E51840B138AdD',
    fallbackHandlerAddress: '0x40A930851BD2e590Bd5A5C981b436de25742E980',
  },
}

const computeCPKAddress = async (provider, address, networkId) => {
  if (!networks[networkId]) {
    throw new Error('unsupported network')
  }

  const predeterminedSaltNonce =
    '0xcfe33a586323e7325be6aa6ecd8b4600d232a9037e83c8ece69413b777dabe65'
  const create2Salt = utils.keccak256(
    utils.defaultAbiCoder.encode(['address', 'uint256'], [address, predeterminedSaltNonce]),
  )
  const proxyFactoryAddress = networks[networkId].proxyFactoryAddress
  const proxyFactory = new ethers.Contract(
    proxyFactoryAddress,
    cpkFactoryAbi,
    provider,
  )

  const masterCopyAddress = networks[networkId].masterCopyAddress
  return utils.getAddress(
    utils
      .solidityKeccak256(
        ['bytes', 'address', 'bytes32', 'bytes32'],
        [
          '0xff',
          proxyFactory.address,
          create2Salt,
          utils.solidityKeccak256(
            ['bytes', 'bytes'],
            [
              await proxyFactory.proxyCreationCode(),
              utils.defaultAbiCoder.encode(
                ['address'],
                [masterCopyAddress],
              ),
            ],
          ),
        ],
      )
      .slice(-40),
  )
}

const Main = () => {
  const [address, setAddress] = useState('')
  const [cpkAddress, setCpkAddress] = useState('')

  const context = useWeb3Context()

  React.useEffect(() => {
    if (!context.library) {
      context.setFirstValidConnector(['MetaMask', 'Infura'])
    }
  }, [context])

  if (!context.library) return null

  const compute = async () => {
    setCpkAddress(await computeCPKAddress(context.library, address, context.networkId))
  }

  return <>
    <input placeholder='Address' value={address} onChange={e => setAddress(e.currentTarget.value)} />
    <button onClick={compute}>Compute CPK address</button>
    <div>{ cpkAddress }</div>
  </>
}

function App() {
  return (
    <div className="App">
      <Web3Provider
        connectors={connectors}
        libraryName={'ethers.js'}
      >
        <Main />
      </Web3Provider>
    </div>
  );
}

export default App;
