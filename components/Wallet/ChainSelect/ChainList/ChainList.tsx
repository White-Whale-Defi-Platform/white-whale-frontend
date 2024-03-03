import React, { useMemo } from 'react';

import { List } from '@chakra-ui/react';
import { useConnect } from '@quirks/react';
import { WalletType } from 'components/Wallet/Modal/WalletModal';
import { useChainInfos } from 'hooks/useChainInfo';

import ChainItem from './ChainItem';

const useFilteredChains = (connectedChainIds) => {
  const chains = useChainInfos();
  const { wallet } = useConnect();

  const connectedChains = useMemo(() => chains.filter((chain) => {
    const isChainConnected =
      wallet?.options.wallet_name === WalletType.leapSnap
        ? chain.coinType === 118
        : connectedChainIds.includes(chain.chainId);

    return isChainConnected;
  }),
  [chains, wallet, connectedChainIds]);

  const removedChains = useMemo(() => chains.filter((chain) => {
    const isChainConnected =
      wallet?.options.wallet_name === WalletType.leapSnap
        ? chain.coinType === 118
        : connectedChainIds.includes(chain.chainId);

    return !isChainConnected;
  }),
  [chains, wallet, connectedChainIds]);

  return [connectedChains, removedChains];
};

const ChainList = ({
  onChange,
  onClose,
  currentChainState,
  connectedChainIds,
}) => {
  const { wallet } = useConnect();
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
          walletType={wallet?.options.wallet_name}
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
          walletType={wallet?.options.wallet_name}
        />
      ))}
    </List>
  );
};

export default ChainList;
