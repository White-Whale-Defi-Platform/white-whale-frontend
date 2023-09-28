import React from 'react'

import { List } from '@chakra-ui/react'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { COSMOS_KIT_WALLET_KEY, ACTIVE_NETWORKS } from 'constants/index'
import { useChainInfos } from 'hooks/useChainInfo'

import ChainItem from './ChainItem'

function ChainList({ onChange, onClose, currentChainState, connectedChainIds }) {
  let chains = useChainInfos();
  const walletType = window.localStorage.getItem(COSMOS_KIT_WALLET_KEY);
  const connectedChains = []
  const removedChains = []
  const filterChain = (chain) => {
    const isChainConnected =
    walletType === WalletType.leapSnap
      ? chain.coinType === 118
      : connectedChainIds.includes(chain.chainId);

    if (isChainConnected) {
      connectedChains.push(chain);
    } else {
      removedChains.push(chain);
    }

    return isChainConnected;
  };

  chains = chains.filter(filterChain);
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
          walletConnected={true}
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
          walletConnected={false}
        />
      ))) : null }
    </List>
  )
}

export default ChainList
