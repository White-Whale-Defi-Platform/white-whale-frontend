import React, { useCallback, useEffect, useMemo } from 'react'

import { Box, Button, Divider } from '@chakra-ui/react'
import { useConnectedWallet } from '@terra-money/wallet-provider'
import Card from 'components/Card'
import WalletIcon from 'components/icons/WalletIcon'
import Select from 'components/Wallet/ChainSelect/Select'
import ChainSelectWithBalance from 'components/Wallet/ChainSelectWithBalance/ChainSelectWithBalance'
import ConnectedWalletWithDisconnect from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWalletWithDisconnect'
import { useChainInfo, useChains } from 'hooks/useChainInfo'
import useTerraModalOrConnectKeplr from 'hooks/useTerraModalOrConnectKeplr'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getPathName } from 'util/route'

const Wallet: any = ({ connected, onDisconnect, onOpenModal }) => {
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)

  const chains = useChains()
  const router = useRouter()
  const chainIdParam = router.query.chainId as string

  const connectedWallet = useConnectedWallet()
  const [chainInfo] = useChainInfo(currentWalletState.chainId)
  const { showTerraModalOrConnectKeplr } =
    useTerraModalOrConnectKeplr(onOpenModal)

  useEffect(() => {
    const defaultChain = chains.find((row) => row.chainId === 'juno-1')
    const targetChain = chains.find(
      (row) => row.label.toLowerCase() === chainIdParam
    )
    if (targetChain && targetChain.chainId !== currentWalletState.chainId) {
      setCurrentWalletState({
        ...currentWalletState,
        chainId: targetChain.chainId,
      })
    }
    if (chains && chains.length > 0 && !targetChain) {
      setCurrentWalletState({
        ...currentWalletState,
        chainId: defaultChain.chainId,
      })
      router.push(getPathName(router, defaultChain.label))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWalletState.chainId, chainIdParam, chains])

  const denom = useMemo(() => {
    if (!chainInfo) return
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainInfo,
    currentWalletState.chainId,
    currentWalletState.network,
    currentWalletState.activeWallet,
    currentWalletState.address,
  ])

  const onChainChange = useCallback(
    (chain) => {
      // disconnect
      onDisconnect()

      // update state
      setCurrentWalletState({ ...currentWalletState, chainId: chain.chainId })

      // update route
      const sourceChain = chains.find(
        (row) => row.chainId.toLowerCase() === chain.chainId
      )
      router.push(getPathName(router, sourceChain.label))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWalletState.chainId, chains, router]
  )

  if (!connected && !connectedWallet) {
    return (
      <>
        <Select
          connected={connected}
          denom={denom?.coinDenom}
          onChange={onChainChange}
          currentWalletState={currentWalletState}
        />
        <Button
          variant="outline"
          display="flex"
          gap="3"
          color="white"
          borderColor="whiteAlpha.400"
          borderRadius="full"
          onClick={showTerraModalOrConnectKeplr}
        >
          <WalletIcon />
          Connect wallet
        </Button>
      </>
    )
  }

  return (
    <>
      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>
        <ChainSelectWithBalance
          connected={connected}
          denom={denom}
          onChainChange={onChainChange}
          currentWalletState={currentWalletState}
        />
        <Box display={{ base: 'none', md: 'block' }}>
          <Divider
            orientation="vertical"
            borderColor="rgba(255, 255, 255, 0.1);"
          />
        </Box>
        <ConnectedWalletWithDisconnect
          connected={connected}
          onDisconnect={onDisconnect}
        />
      </Card>
    </>
  )
}

export default Wallet
