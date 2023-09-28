import React from 'react'

import { List } from '@chakra-ui/react'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { COSMOS_KIT_WALLET_KEY } from 'constants/index'
import { useChainInfos } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentChainState, connChainids: connChainIds }) {
  let chains = useChainInfos()
  const removedChains = []
  if (window.localStorage.getItem(COSMOS_KIT_WALLET_KEY) == WalletType.leapSnap) {
    const snapActivatedChains = []
    chains.forEach((chain) => {
      if (chain.coinType == 118) {
        snapActivatedChains.push(chain)
      }
    })
    chains = snapActivatedChains
  } else if (connChainIds && connChainIds.length >= 1) {
    const connChains = []
    chains.forEach((chain) => {
      if (connChainIds.includes(chain.chainId)) {
        connChains.push(chain)
      } else {
        removedChains.push(chain)
      }
    })
    chains = connChains
  }
  return (
    <List spacing={1} color="white" width="full">
      {chains.map((chain, index) => (
        <ChainItem
          key={chain?.chainId + chain?.chainName}
          chain={chain}
          index={index}
          onChange={onChange}
          onClose={onClose}
          chainList={chains}
          active={currentChainState?.chainId === chain?.chainId}
          walletNotConnected={false}
        />
      ))}
      {removedChains.length >= 1 ? (removedChains.map((chain, index) => (
        <ChainItem
          key={chain?.chainId + chain?.chainName}
          chain={chain}
          index={index}
          onChange={onChange}
          onClose={onClose}
          chainList={chains}
          active={currentChainState?.chainId === chain?.chainId}
          walletNotConnected={true}
        />
      ))) : null }
    </List>
  )
}

export default ChainList
