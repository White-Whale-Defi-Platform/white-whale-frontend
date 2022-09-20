import React from 'react'
import ChainItem from './ChainItem'
import { List } from '@chakra-ui/react'

import { useChains } from 'hooks/useChainInfo'

function ChainList({onChange, onClose}) {
  const chains = useChains()
  return (
  <List spacing={1} color="white" width="full" >
    {chains.map((chain, index) => (
      <ChainItem key={chain.chainId + chain?.chainName} chain={chain} index={index} onChange={onChange} onClose={onClose} chainList={chains} />
    ))}
  </List>
  )
}

export default ChainList