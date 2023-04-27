import React from 'react'

import { List } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentWalletState }) {
  const chains = useChains()

  // if (currentWalletState.activeWallet === 'station') {
  //   return chains.filter(
  //     (chain) => chain.chainId !== 'comdex-1' && chain.chainId !== 'injective-1'
  //   );
  // }

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
          active={currentWalletState?.chainId === chain?.chainId}
          walletState={currentWalletState}
        />
      ))}
    </List>
  )
}

export default ChainList
