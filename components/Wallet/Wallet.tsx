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



const options = [
  {
    label: "Juno",
    value: "uni-3",
    icon: "/juno.svg"
  },
  {
    label: "Terra",
    value: "localterra",
    icon: "https://assets.terra.money/icon/svg/LUNA.png"
  }
]

const Wallet: any = ({ walletName, connected, onConnect, onDisconnect }) => {

  const baseToken = useBaseTokenInfo()
  // const { address, chainId } = useRecoilValue(walletState)
  const [{ address, chainId }, setWalletState] = useRecoilState(walletState)
  // const [activeChain, setActiveChain] = useRecoilState(activeChainAtom)
  const defaultChain = options.find(({ value }) => value === chainId)
  const [chainInfo] = useChainInfo(chainId || 'uni-3')
  const { balance } = useTokenBalance(baseToken?.symbol)

  const denom = useMemo(() => {

    if (!chainInfo) return
    const [coinDenom] = chainInfo?.currencies || []
    return coinDenom

  }, [chainInfo,])

  const chains = useChains()

  const chainList = useMemo(() => {

    return chains.map(({ chainId, chainName }) => ({
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
    // console.log({chain})
    // setActiveChain(chain?.value)
    if (connected)
      onConnect(chain?.value)
  }

  useEffect(() => {
    if (connected){
      onConnect(chainId)
    }
  }, [])

  if (!connected) {
    return (
      <>
        {/* <Select options={options} width="fit-content" onChange={onChainChange} defaultSelcted={options?.[0]} /> */}
        <WalletSelect denom={denom?.coinDenom} chainList={chainList} onChange={onChainChange} />
        <Button
          variant="primary"
          // type="button"
          color="white"
          // borderWidth="1px"
          borderColor="whiteAlpha.400"
          borderRadius="full"
          // py="3"
          // px="4"
          onClick={() => onConnect("uni-3")}>
          Connect wallet
        </Button>
        {/* <WalletModal isOpen={isOpen} onClose={onClose} /> */}
      </>
    )
  }

  return (
    <>
      {/* <Select options={options} width="fit-content" onChange={onChainChanage} defaultSelcted={defaultChain} /> */}


      <Card paddingY={2} paddingX={6} gap={4}>

        <HStack spacing="4" display={{ base: "none", md: "flex" }}>
          <Text fontSize="16px">{balance}</Text>
          <WalletSelect denom={denom?.coinDenom} chainList={chainList} onChange={onChainChanage} />
          {/* <Text fontSize="16px">{denom?.coinDenom}</Text> */}
        </HStack>

        <Box h="6" display={{ base: "none", md: "block" }}>
          <Divider orientation="vertical" borderColor="rgba(255, 255, 255, 0.1);" />
        </Box>

        <HStack spacing="3">
          <KeplrWalletIcon size="20px" />
          <Text color="brand.200" size="16px">
            {truncate(address, [4, 6])}
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