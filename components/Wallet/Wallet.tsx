import {
  Box,
  Button,
  Divider,
  useDisclosure} from "@chakra-ui/react";
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import { useChainInfo, useChains } from 'hooks/useChainInfo';
import React, { useCallback, useEffect, useMemo } from 'react'
import { useRecoilState} from 'recoil'
import { walletState} from 'state/atoms/walletAtoms'

import useTerraModalOrConnectKeplr from '../../hooks/useTerraModalOrConnectKeplr';
import useWalletConnect from '../../hooks/useWalletConnect';
import Card from '../Card';
import WalletIcon from "../icons/WalletIcon";
import ConnectedWalletWithDisconnect from "./ConnectedWallet/ConnectedWalletWithDisconnect";
import WalletSelectWithBalance from "./ConnectedWallet/WalletSelectWithBalance";
import Select from './Select';

const Wallet: any = ({ connected, onDisconnect, isOpenModal, onCloseModal, onOpenModal}) => {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)

  const connectedWallet = useConnectedWallet()
  const chains = useChains()
  let [chainInfo] = useChainInfo(currentWalletState.chainId)
  const {connectKeplrMemo, connectStation} = useWalletConnect(onCloseModal)
  const {showTerraModalOrConnectKeplr} = useTerraModalOrConnectKeplr(onOpenModal)

  const lcd = useLCDClient()
  
  const denom = useMemo(() => {
  if (!chainInfo) return
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom
  }, [chainInfo, currentWalletState.chainId, currentWalletState.network, currentWalletState.activeWallet, currentWalletState.address])


  const onChainChange = useCallback((chain) => {
    // should *not* need to disconnect on chain change,
    onDisconnect()
    setCurrentWalletState({...currentWalletState, chainId: chain.chainId})
  }, [currentWalletState.chainId, chainInfo])

  useEffect(() => {
    currentWalletState.activeWallet === 'station' && connectStation(currentWalletState.chainId) 
  }, [currentWalletState.chainId, currentWalletState.activeWallet, connectedWallet])

  // useEffect(() => {
  //   chainInfo && setCurrentWalletState({...currentWalletState, chainId: chainInfo.chainId})
  // }, [currentWalletState.network])

  if (!connected && !connectedWallet) {
    return (
      <>
        <Select
          connected={connected}
          denom={denom?.coinDenom}
          chainList={chains}
          onChange={onChainChange}
          onDisconnect={onDisconnect}
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
        {/* <WalletModal isOpenModal={isOpenModal} onCloseModal={onCloseModal} /> */}
      </>
    )
  }

  return (
    <>
      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>
        <WalletSelectWithBalance connected={connected} denom={denom} onChainChange={onChainChange} />
        <Box display={{ base: "none", md: "block" }}>
          <Divider orientation="vertical" borderColor="rgba(255, 255, 255, 0.1);" />
        </Box>
        <ConnectedWalletWithDisconnect connected={connected} onDisconnect={onDisconnect} />
      </Card>
    </>
  )
}

export default Wallet
