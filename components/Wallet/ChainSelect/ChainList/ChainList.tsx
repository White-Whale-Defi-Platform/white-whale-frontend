import React from 'react';

import { List } from '@chakra-ui/react';
import { WalletType } from 'components/Wallet/Modal/WalletModal';
import { COSMOS_KIT_WALLET_KEY } from 'constants/index';
import { useChainInfos } from 'hooks/useChainInfo';

import ChainItem from './ChainItem';

const useFilteredChains = (connectedChainIds) => {
  const chains = useChainInfos();
  const walletType = window.localStorage.getItem(COSMOS_KIT_WALLET_KEY);

  const connectedChains = [];
  const removedChains = [];

  chains.forEach((chain) => {
    const isChainConnected =
      walletType === WalletType.leapSnap
        ? chain.coinType === 118
        : connectedChainIds.includes(chain.chainId);

    if (isChainConnected) {
      connectedChains.push(chain);
    } else {
      removedChains.push(chain);
    }
  });

  return [connectedChains, removedChains];
};

const ChainList = ({ onChange, onClose, currentChainState, connectedChainIds }) => {
  const walletType = window.localStorage.getItem(COSMOS_KIT_WALLET_KEY);
  const [connectedChains, removedChains] = useFilteredChains(connectedChainIds);

  return (
    <List spacing={1} color="white" width="full">
      {connectedChains.map((chain) => (
        <ChainItem
          key={chain?.chainId}
          chain={chain}
          onChange={onChange}
          onClose={onClose}
          active={currentChainState?.chainId === chain?.chainId}
          walletConnected={true}
          walletType={walletType}
        />
      ))}
      {removedChains.map((chain) => (
        <ChainItem
          key={chain?.chainId}
          chain={chain}
          onChange={onChange}
          onClose={onClose}
          active={currentChainState?.chainId === chain?.chainId}
          walletConnected={false}
          walletType={walletType}
        />
      ))}
    </List>
  );
};

export default ChainList;
