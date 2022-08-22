import React, { useEffect, useMemo } from 'react'
import {
  HStack,
  IconButton,
  Box,
  Divider,
  Button,
  Text
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



const options = [
  {
    label: "Juno",
    value: "uni-3",
    icon: "/logos/juno.svg"
  },
  {
    label: "Terra",
    value: "pisco-1",
    icon: "/logos/luna.svg"
  }
]

const Wallet: any = ({ walletName, connected, onConnect, onDisconnect }) => {

  const baseToken = useBaseTokenInfo()
  // const { address, chainId } = useRecoilValue(walletState)
  const [{ address, chainId }, setWalletState] = useRecoilState(walletState)
  // const [activeChain, setActiveChain] = useRecoilState(activeChainAtom)
  const currentChain = options.find(({ value }) => value === chainId)
  const [chainInfo] = useChainInfo(chainId || 'uni-3')
  const { balance } = useTokenBalance(baseToken?.symbol)
  const toast = useToast()

  const denom = useMemo(() => {

    if (!chainInfo) return
    const [coinDenom] = chainInfo?.currencies || []
    return coinDenom

  }, [chainInfo,])

  const chains = useChains()

  const chainList = useMemo(() => {
    return chains.map(({ chainId, chainName }) => ({
      ...options.find(({ value }) => value === chainId),
      chainName,
      value: chainId,
      active: chainId === chainInfo?.chainId
    }))

  }, [chains, chainInfo])

  const onChainChange = (chain) => {
    setWalletState((value) => ({
      ...value,
      chainId: chain?.value
    }))
  }

  const onChainChanage = (chain) => {
    if (connected)
      onConnect(chain?.value)
  }

  useEffect(() => {
    if (connected) {
      onConnect(chainId)
    }
  }, [])

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
    return `${chainName}${truncate(address, [0, 6])}`
  }

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(address)
      toast({
        title: 'Address copied to clipboard',
        status: 'success',
        duration: 1000,
        position:"top-right",
        isClosable: true
      })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      {/* <Select options={options} width="fit-content" onChange={onChainChanage} defaultSelcted={defaultChain} /> */}


      <Card paddingY={1} paddingX={6} gap={4}>

        <HStack spacing="4" display={{ base: "flex", md: "flex" }}>
          <Text fontSize="16px">{balance?.toFixed(1)}</Text>
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

        <HStack spacing="3" as={Button} variant="unstyled" onClick={copyToClipboard}>
          <KeplrWalletIcon />
          <Text color="brand.200" size="16px">
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