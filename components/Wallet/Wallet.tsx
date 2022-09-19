import React, { useCallback, useMemo } from 'react'
import { useRecoilState} from 'recoil'
import {
  Box,
  Button,
  Divider} from "@chakra-ui/react";
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useChainInfo} from 'hooks/useChainInfo';

import { walletState} from 'state/atoms/walletAtoms'
import useTerraModalOrConnectKeplr from 'hooks/useTerraModalOrConnectKeplr';
import Card from 'components/Card';
import WalletIcon from "components/icons/WalletIcon";
import ConnectedWalletWithDisconnect from "components/Wallet/ConnectedWalletWithDisconnect/ConnectedWalletWithDisconnect";
import ChainSelectWithBalance from "components/Wallet/ChainSelectWithBalance/ChainSelectWithBalance";
import Select from 'components/Wallet/ChainSelect/Select';

const Wallet: any = ({ connected, onDisconnect, onOpenModal}) => {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)

  const connectedWallet = useConnectedWallet()
  let [chainInfo] = useChainInfo(currentWalletState.chainId)
  const {showTerraModalOrConnectKeplr} = useTerraModalOrConnectKeplr(onOpenModal)

  const denom = useMemo(() => {
  if (!chainInfo) return
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom
  }, [chainInfo, currentWalletState.chainId, currentWalletState.network, currentWalletState.activeWallet, currentWalletState.address])


  const onChainChange = useCallback((chain) => {
    onDisconnect()
    setCurrentWalletState({...currentWalletState, chainId: chain.chainId})
  }, [currentWalletState.chainId, chainInfo])

  if (!connected && !connectedWallet) {
    return (
      <>
        <Select
          connected={connected}
          denom={denom?.coinDenom}
          onChange={onChainChange}
        />
        <Button
          variant="outline"
          display="flex"
          gap="3"
          color="white"
          borderColor="whiteAlpha.400"
          borderRadius="full"
          onClick={showTerraModalOrConnectKeplr}>
          <WalletIcon />
          Connect wallet
        </Button>
      </>
    )
  }

  return (
    <>
      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>
        <ChainSelectWithBalance connected={connected} denom={denom} onChainChange={onChainChange} />
        <Box display={{ base: "none", md: "block" }}>
          <Divider orientation="vertical" borderColor="rgba(255, 255, 255, 0.1);" />
        </Box>
        <ConnectedWalletWithDisconnect connected={connected} onDisconnect={onDisconnect} />
      </Card>
    </>
  )
}

export default Wallet
