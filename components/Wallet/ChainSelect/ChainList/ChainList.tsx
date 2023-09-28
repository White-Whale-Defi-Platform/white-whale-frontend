import React, { useEffect, useState } from 'react';

import { List } from '@chakra-ui/react';
import { WalletType } from 'components/Wallet/Modal/WalletModal';
import { COSMOS_KIT_WALLET_KEY } from 'constants/index';
import { useChainInfos } from 'hooks/useChainInfo';

import ChainItem from './ChainItem';

export const ChainList = ({ onChange, onClose, currentChainState, connectedChainIds }) => {
  const [chains, setChains] = useState([]);
  const [removed, setRemoved] = useState([]);
  const chainInfos = useChainInfos(); // Call useChainInfos here

  useEffect(() => {
    if (window.localStorage.getItem(COSMOS_KIT_WALLET_KEY) === WalletType.leapSnap) {
      const snapChains = chainInfos.filter((row) => row.coinType === 118);
      setChains(snapChains);
    } else if (connectedChainIds && connectedChainIds.length >= 1) {
      const connChains = [];
      const removedChains = [];

      chainInfos.forEach((row) => {
        if (connectedChainIds.includes(row.chainId)) {
          connChains.push(row);
        } else {
          removedChains.push(row);
        }
      });

      setChains(connChains);
      setRemoved(removedChains);
    } else {
      setChains(chainInfos);
    }
  }, [connectedChainIds, chainInfos]);

  return (
    <List spacing={1} color="white" width="full">
      {chains.map((chain, index) => (
        <ChainItem
          key={chain?.chainId}
          chain={chain}
          index={index}
          onChange={onChange}
          onClose={onClose}
          chainList={chains}
          active={currentChainState?.chainId === chain?.chainId}
          isWalletConnected={true}
        />
      ))}
      {removed.length >= 1 &&
        removed.map((chain, index) => (
          <ChainItem
            key={`${chain?.chainId}${index}`}
            chain={chain}
            index={index}
            onChange={onChange}
            onClose={onClose}
            chainList={chains}
            active={currentChainState?.chainId === chain?.chainId}
            isWalletConnected={false}
          />
        ))}
    </List>
  );
};
