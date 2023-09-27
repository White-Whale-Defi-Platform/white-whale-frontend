import React from 'react'

import { List } from '@chakra-ui/react'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { COSMOS_KIT_WALLET_KEY } from 'constants/index'
import { useChainInfos } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentChainState, connChainids }) {
  let chains = useChainInfos()
  const removed = []
  if (window.localStorage.getItem(COSMOS_KIT_WALLET_KEY) == WalletType.leapSnap) {
    const snapChains = []
    chains.forEach((row) => {
      if (row.coinType == 118) {
        snapChains.push(row)
      }
    })
    chains = snapChains
  } else if (connChainids && connChainids.length >= 1) {
    const connChains = []
    chains.forEach((row) => {
      if (connChainids.includes(row.chainId)) {
        connChains.push(row)
      } else {
        removed.push(row)
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
      {removed.length >= 1 ? (removed.map((chain, index) => (
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
