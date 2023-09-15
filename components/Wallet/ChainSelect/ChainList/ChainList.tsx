import React from 'react'

import { List } from '@chakra-ui/react'
import { useChains2 } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentChainState }) {
  let chains = useChains2()
  if (window.localStorage.getItem('cosmos-kit@2:core//current-wallet') == 'leap-metamask-cosmos-snap') {
    const snapChains = []
    chains.forEach((row) => {
      if (row.coinType == 118) {
        snapChains.push(row)
      }
    })
    chains = snapChains
  }
  return (
    <List spacing={1} color="white" width="full">
      {chains.map((chain, index) => (
        <ChainItem
          key={chain.chainId + chain?.chainName}
          chain={chain}
          index={index}
          onChange={onChange}
          onClose={onClose}
          chainList={chains}
          active={currentChainState?.chainId === chain?.chainId}
          currentChainState={currentChainState}
        />
      ))}
    </List>
  )
}

export default ChainList
