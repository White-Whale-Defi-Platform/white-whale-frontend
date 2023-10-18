import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'

import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react'
import { useChains } from '@cosmos-kit/react-lite'
import Card from 'components/Card'
import WalletIcon from 'components/Icons/WalletIcon'
import defaultTokens from 'components/Pages/Trade/Swap/defaultTokens.json'
import { tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import SelectChainModal from 'components/Wallet/ChainSelect/SelectChainModal'
import { ChainSelectWithBalance } from 'components/Wallet/ChainSelectWithBalance/ChainSelectWithBalance'
import {
  ConnectedWalletWithDisconnect,
} from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWalletWithDisconnect'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import {
  ACTIVE_BONDING_NETWORKS,
  ACTIVE_NETWORKS,
  ACTIVE_NETWORKS_WALLET_NAMES,
  ChainId,
  COSMOS_KIT_WALLET_KEY,
  WALLET_CHAIN_NAMES_BY_CHAIN_ID,
} from 'constants/index'
import { useChainInfo, useChainInfos } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { chainState, NetworkType } from 'state/chainState'
import { TokenItemState } from 'types/index'
import { getPathName } from 'util/route'

const Wallet = () => {
  const [isInitialized, setInitialized] = useState(false)
  const [currentChainState, setCurrentChainState] = useRecoilState(chainState)
  const [_, setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
  const chains: Array<any> = useChainInfos()
  const [walletChains, setWalletChains] = useState<string[]>([])
  const chainName = useMemo(() => window.location.pathname.split('/')[1].split('/')[0], [window.location.pathname])
  const [currentConnectedChainIds, setCurrentConnectedChainIds] = useState([])
  const allChains = useChains(walletChains)
  const router = useRouter()

  const [chainInfo] = useChainInfo(currentChainState.chainId)
  const { isWalletConnected, disconnect, openView } = allChains[WALLET_CHAIN_NAMES_BY_CHAIN_ID[ACTIVE_NETWORKS[currentChainState.network][chainName]]] || {}
  const queryClient = useQueryClient()

  const [chainIdParam, setChainIdParam] = useState<string>(null)

  useEffect(() => {
    if (chainName && currentChainState.network === NetworkType.mainnet) {
      setCurrentChainState({
        chainName,
        chainId: ACTIVE_NETWORKS[currentChainState.network][chainName],
        network: currentChainState.network,
        activeWallet: currentChainState.activeWallet,
        walletChainName: WALLET_CHAIN_NAMES_BY_CHAIN_ID[ACTIVE_NETWORKS[currentChainState.network][chainName]],
      })
    }

    const walletType = window.localStorage.getItem(COSMOS_KIT_WALLET_KEY)

    if (walletType === WalletType.leapExtension || walletType === WalletType.leapMobile) {
      // Window.leap.defaultOptions
      window.leap.defaultOptions = {
        sign: {
          preferNoSetFee: true,
        },
      }
    }

    if (walletType === WalletType.leapSnap) {
      const snapChainIds = chains.
        filter((row) => row.coinType === 118).
        map((row) => WALLET_CHAIN_NAMES_BY_CHAIN_ID[row.chainId]);

      setWalletChains(snapChainIds);
      setCurrentConnectedChainIds(snapChainIds);
    } else if (walletType === WalletType.terraExtension || walletType === WalletType.keplrExtension) {
      const walletWindowConnection = walletType === WalletType.terraExtension ? (window.station?.keplr) : (window?.keplr)

      const getAddedStationChainsIds = async () => {
        const chainInfos = await walletWindowConnection?.getChainInfosWithoutEndpoints()
        if (!chainInfos) {
          await disconnect()
          return null
        }
        return chainInfos.map((chain: { chainId: string }) => chain.chainId)
      };
      const filterChains = async () => {
        const addedChains = await getAddedStationChainsIds()
        const filteredChains = chains.filter((chain) => addedChains.includes(chain.chainId) && WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId])
        const chainNames = filteredChains.map((chain) => WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId])
        return [chainNames, filteredChains.map((chain) => chain.chainId)]
      };
      filterChains().then(async ([chainNames, ids]) => {
        if (chainNames.includes('injective')) {
          try {
            await walletWindowConnection.getKey(ChainId.injective)
          } catch {
            console.error('Injective not activated');
            const injIndex = chainNames.indexOf('injective')
            if (injIndex !== -1) {
              chainNames.splice(injIndex, 1)
              ids.splice(injIndex, 1)
            }
          }
        }
        setWalletChains(chainNames)
        setCurrentConnectedChainIds(ids)
      });
    } else if (walletChains.length === 0) {
      setCurrentConnectedChainIds(Object.values(ACTIVE_NETWORKS[currentChainState.network]))
      setWalletChains(ACTIVE_NETWORKS_WALLET_NAMES[currentChainState.network])
    } else {
      setCurrentConnectedChainIds(Object.values(ACTIVE_NETWORKS[currentChainState.network]))
    }
  }, [chains, currentChainState.network, chainName, window.localStorage.getItem(COSMOS_KIT_WALLET_KEY)])

  const resetWallet = () => {
    setCurrentConnectedChainIds([])
    queryClient.clear()
    setWalletChains([])
    disconnect()
  }

  useEffect(() => {
    if (router.query.chainId) {
      setChainIdParam(router.query.chainId as string)
    }
  }, [router.query.chainId])

  useEffect(() => {
    if (router.pathname === '/') {
      return
    }

    const defaultChainId =
      currentChainState.network === NetworkType.mainnet
        ? ChainId.migaloo
        : ChainId.narwhal

    const defaultChainName =
      currentChainState.network === NetworkType.mainnet ? 'migaloo' : 'narwhal'
    const defaultWalletChainName = currentChainState.network === NetworkType.mainnet ? 'migaloo' : 'migalootestnet'

    if (!ACTIVE_NETWORKS[currentChainState.network][chainIdParam] && chainIdParam) {
      setCurrentChainState({
        ...currentChainState,
        chainId: defaultChainId,
        chainName: defaultChainName,
        walletChainName: defaultWalletChainName,
      })
    }
    setInitialized(true)
  }, [chainIdParam])

  const denom = useMemo(() => {
    if (!chainInfo) {
      return null
    }
    const [coinDenom] = (chainInfo as any)?.currencies || []
    return coinDenom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainInfo,
    currentChainState.chainId,
    currentChainState.network,
    currentChainState.activeWallet,
  ])

  const onChainChange = async (chain: { chainId: string; bech32Config: { bech32PrefixAccAddr: any }; label:string }) => {
    if (
      !ACTIVE_BONDING_NETWORKS.includes(chain.chainId) &&
      router.pathname.includes('dashboard')
    ) {
      await router.push('/swap')
    }
    setCurrentChainState({ ...currentChainState,
      chainId: chain.chainId,
      chainName: chain.label.toLowerCase(),
      walletChainName: WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId] })
    queryClient.clear()
    const [defaultFrom, defaultTo] = defaultTokens[currentChainState.network][WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId]]
    const newState: TokenItemState[] = [
      {
        tokenSymbol: String(defaultFrom.tokenSymbol),
        amount: 0,
        decimals: 6,
      },
      {
        tokenSymbol: String(defaultTo.tokenSymbol),
        amount: 0,
        decimals: 6,
      },
    ]
    setTokenSwapState(newState)
    if (isWalletConnected) {
      const newChain = allChains[WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId]]
      if (window.localStorage.getItem(COSMOS_KIT_WALLET_KEY) !== WalletType.leapSnap && window.localStorage.getItem(COSMOS_KIT_WALLET_KEY) !== WalletType.terraExtension) {
        await newChain.connect()
      } else {
        resetWallet()
      }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }

  useEffect(() => {
    if (!isInitialized) {
      return
    }
    if (!currentChainState.chainId) {
      return
    }
    if (router.pathname.includes('/404')) {
      router.push('/404')
    }

    const sourceChain = chains.find((row) => row.chainId.toLowerCase() === currentChainState.chainId)
    if (sourceChain && !router.pathname.includes('/404')) {
      const path = getPathName(router, sourceChain.label)
      router.push(path)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChainState.chainId, isInitialized])
  if (!isWalletConnected) {
    return (
      <><HStack align="right" boxSize={'flex'} paddingLeft={'1'} spacing={'2'} paddingTop={['2', '2', '0']}>
        <SelectChainModal
          connected={isWalletConnected}
          denom={denom?.coinDenom}
          onChange={onChainChange}
          currentChainState={currentChainState}
          connectedChainIds={currentConnectedChainIds}
        />
        <Button
          variant="outline"
          display="flex"
          gap="1"
          color="white"
          borderColor="whiteAlpha.400"
          borderRadius="full"
          onClick={openView}
        >
          <WalletIcon/>
          <Text>Connect</Text>
          <Text display={['none', 'none', 'contents']}>Wallet</Text>
        </Button></HStack>
      </>
    )
  }

  return (
    <>
      <Card paddingY={[0, 1]} paddingX={[2, 6]} gap={4}>
        <ChainSelectWithBalance
          connected={isWalletConnected}
          denom={denom}
          onChainChange={onChainChange}
          currentChainState={currentChainState}
          currentConnectedChainIds={currentConnectedChainIds}
        />
        <Box display={{ base: 'block',
          md: 'block' }}>
          <Divider
            orientation="vertical"
            borderColor="rgba(255, 255, 255, 0.1);"
          />
        </Box>
        <ConnectedWalletWithDisconnect
          connected={isWalletConnected}
          onDisconnect={resetWallet}
        />
      </Card>
    </>
  )
}

export default Wallet
