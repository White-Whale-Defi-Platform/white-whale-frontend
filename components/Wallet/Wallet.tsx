import React, { useEffect, useMemo } from 'react'
import {
  HStack,
  IconButton,
  Box,
  Divider,
  Button,
  Text,
  Spinner
} from "@chakra-ui/react";
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useRecoilValue, useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { truncate } from 'util/truncate';

// import WalletModal from "./WalletModal";
import LogoutIcon from "../icons/LogoutIcon";
import WalletIcon from "../icons/WalletIcon";
import Card from '../Card';
import Select from '../Select';
import { activeChain as activeChainAtom } from 'state/atoms/activeChain';
import { useChainInfo, useChains } from 'hooks/useChainInfo';
import KeplrWalletIcon from '../icons/KeplrWalletIcon';
import WalletSelect from './WalletSelect';
import { useToast } from '@chakra-ui/react'


const Wallet: any = ({ walletName, connected, onConnect, onDisconnect }) => {

  const baseToken = useBaseTokenInfo()
  const [{ address, chainId, status }, setWalletState] = useRecoilState(walletState)
  const chains = useChains()
  const [chainInfo] = useChainInfo(chainId)
  const { balance, isLoading } = useTokenBalance(baseToken?.symbol)
  const toast = useToast()

  const denom = useMemo(() => {

    if (!chainInfo) return
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom

  }, [chainInfo, chainId])


  const chainList = useMemo(() => {
    return chains.map((chain) => ({
      // ...options.find(({ value }) => value === chainId),
      ...chain,
      active: chain?.chainId === (chainInfo as any)?.chainId
    }))

  }, [chains, chainInfo, chainId])

  const onChainChange = (chain) => {
    setWalletState((value) => ({
      ...value,
      chainId: chain?.chainId
    }))
  }

  const onChainChanage = (chain) => {
    if (connected)
      onConnect(chain?.chainId)
  }

  useEffect(() => {
    if (connected && chainId && chains.length > 0) {
      onConnect(chainId)
    }
  }, [chains, chainId, connected])

  if (!connected) {
    return (
      <>
        {/* <Select options={options} width="fit-content" onChange={onChainChange} defaultSelcted={options?.[0]} /> */}
        <WalletSelect
          connected={connected}
          denom={denom?.coinDenom}
          chainList={chainList}
          onChange={onChainChange} />
        <Button
          variant="outline"
          display="flex"
          gap="3"
          color="white"
          borderColor="whiteAlpha.400"
          borderRadius="full"
          onClick={() => onConnect(chainId)}>
          <WalletIcon />
          Connect wallet
        </Button>

        {/* <WalletModal isOpen={isOpen} onClose={onClose} /> */}
      </>
    )
  }

  const truncatWalletAddress = (addr: string) => {
    const chainName = addr.substring(0, addr.indexOf("1") | 4)
    return `${chainName}${truncate(address, [0, 4])}`
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
      {/* <Select options={options} width="fit-content" onChange={onChainChanage} defaultSelcted={defaultChain} /> */}


      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>

        <HStack spacing="4"  >
          {isLoading ? (
            <Spinner color='band.500' size='xs' />
          ) : (
            <Text fontSize="16px" display={['none', 'flex']}>{balance?.toFixed(1)}</Text>
          )}
          
          <WalletSelect
            connected={connected}
            denom={denom?.coinDenom}
            chainList={chainList}
            onChange={onChainChanage} />
          {/* <Text fontSize="16px">{denom?.coinDenom}</Text> */}
        </HStack>

        <Box display={{ base: "none", md: "block" }}>
          <Divider orientation="vertical" borderColor="rgba(255, 255, 255, 0.1);" />
        </Box>

        <HStack as={Button} variant="unstyled" onClick={copyToClipboard} width="full">
          <Box>
            <KeplrWalletIcon />
          </Box>
          <Text color="brand.200" fontSize={['14px', '16px']}>
            {truncatWalletAddress(address)}
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
          onClick={onDisconnect}
        />


      </Card>
    </>
  )
}

export default Wallet