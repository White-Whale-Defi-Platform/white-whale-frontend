import {
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  Img,
  Spinner,
  Text,
  useDisclosure} from "@chakra-ui/react";
import { useToast } from '@chakra-ui/react'
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import { useChainInfo, useChains } from 'hooks/useChainInfo';
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import React, { useEffect, useMemo } from 'react'
import { useRecoilState} from 'recoil'
import { walletState} from 'state/atoms/walletAtoms'
import { truncate } from 'util/truncate';

import useTerraModalOrConnectKeplr from '../../hooks/useTerraModalOrConnectKeplr';
import useWalletConnect from '../../hooks/useWalletConnect';
import { activeWalletAtom } from '../../state/atoms/activeWalletAtom';
import Card from '../Card';
import KeplrWalletIcon from '../icons/KeplrWalletIcon';
import LogoutIcon from "../icons/LogoutIcon";
import WalletIcon from "../icons/WalletIcon";
import WalletModal from './Modal/Modal';
import WalletSelect from './WalletSelect';

const Wallet: any = ({ connected, onDisconnect, disconnect }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const baseToken = useBaseTokenInfo()
  const [{ address, chainId}, setWalletState] = useRecoilState(walletState)
  const [activeWallet] = useRecoilState(activeWalletAtom)
  const connectedWallet = useConnectedWallet()
  const chains = useChains()
  let [chainInfo] = useChainInfo(chainId)
  const { balance, isLoading } = useTokenBalance(baseToken?.symbol)
  const toast = useToast()
  const {connectKeplr, connectStation} = useWalletConnect()
  const {showTerraModalOrConnectKeplr} = useTerraModalOrConnectKeplr(onOpen)

  const lcd = useLCDClient()

  const denom = useMemo(() => {
  if (!chainInfo) return
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom
  }, [chainInfo, chainId])

  const chainList = useMemo(() => {
    return chains.map((chain) => ({
      ...chain,
      active: chain?.chainId === (chainInfo as any)?.chainId
    }))

  }, [chains, chainInfo, chainId])

  const onChainChange = (chain) => {
    // should *not* need to disconnect on chain change,
    // just showed the wrong network name for the wallet that is connected without this
    onDisconnect()
    setWalletState((value) => ({
      ...value,
      chainId: chain.chainId
    }))
  }

  useEffect(() => {
    activeWallet === 'station' ? connectStation(chainId) : connectKeplr(chainId)
  }, [activeWallet, connectedWallet, lcd])

  if (!connected && !connectedWallet) {
    return (
      <>
        <WalletSelect
          connected={connected}
          denom={denom?.coinDenom}
          chainList={chainList}
          onChange={onChainChange}
          connectedWallet={connectedWallet}
          onDisconnect={onDisconnect}
          disconnect={disconnect} />
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
        <WalletModal isOpen={isOpen} onClose={onClose} />
      </>
    )
  }

  const truncatWalletAddress = (addr: string) => {
    const chainName = addr.substring(0, addr.indexOf("1") | 4)
    return connected ? `${chainName}${truncate(address, [0, 4])}` : `${chainName}${truncate(connectedWallet.walletAddress, [0, 4])}`
  }

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(address)
      toast({
        title: 'Address copied to clipboard',
        status: 'success',
        duration: 1000,
        position: "top-right",
        isClosable: true
      })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>
        <HStack spacing="4"  >
          {isLoading ? (
            <Spinner color='white' size='xs' />
          ) : (
            <Text fontSize="16px" display={['none', 'flex']}>{balance?.toFixed(1)}</Text>
          )}

          <WalletSelect
            connected={connected}
            denom={denom?.coinDenom}
            chainList={chainList}
            onChange={onChainChange}
            connectedWallet={connectedWallet}
            onDisconnect={onDisconnect}
            disconnect={disconnect} />
        </HStack>

        <Box display={{ base: "none", md: "block" }}>
          <Divider orientation="vertical" borderColor="rgba(255, 255, 255, 0.1);" />
        </Box>

        <HStack padding="0" as={Button} variant="unstyled" onClick={copyToClipboard} width="full">
          {connected ?
          (<Box>
            <KeplrWalletIcon />
          </Box>) :
          (<Box  width="100">
            <Img  width="6"  src={connectedWallet.connection.icon} />
          </Box>)
          }
          <Text color="brand.200" fontSize={['14px', '16px']}>
            {connected ? truncatWalletAddress(address)  : truncatWalletAddress(connectedWallet.walletAddress)}
          </Text>
        </HStack>

        <IconButton
          aria-label="Logout"
          icon={<LogoutIcon />}
          variant="unstyled"
          size="xs"
          _focus={{
            boxShadow: "none",
          }}
          _hover={{
            color: "brand.500",
          }}
          onClick={ onDisconnect }
        />
      </Card>
    </>
  )
}

export default Wallet
