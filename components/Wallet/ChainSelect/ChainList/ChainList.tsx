import React from 'react'

import { List } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentChainState }) {
  const chains = useChains()

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
