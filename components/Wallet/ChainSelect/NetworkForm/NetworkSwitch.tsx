import { useQueryClient } from 'react-query'

import { Switch } from '@chakra-ui/react'
import { useConnect } from '@quirks/react'
import { store } from '@quirks/store'
import defaultTokens from 'components/Pages/Trade/Swap/defaultTokens.json'
import { tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import { assetsLists, chains, testnetAssetsLists, testnetChains } from 'constants/chains'
import { MAINNET_TESTNET_CHAIN_ID_MAP, NETWORK_MAP, WALLET_CHAIN_NAME_MAINNET_TESTNET_MAP } from 'constants/index'
import { useRecoilState } from 'recoil'
import { NetworkType, chainState } from 'state/chainState'
import { TokenItemState } from 'types/index'

export const NetworkSwitch = () => {
  const queryClient = useQueryClient()
  const [currentChainState, setCurrentChainState] = useRecoilState(chainState)
  const [_, setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenSwapAtom)
  const { disconnect, connected } = useConnect();

  const changeNetwork = () => {
    queryClient.clear()

    const updatedChainId =
      MAINNET_TESTNET_CHAIN_ID_MAP?.[currentChainState.chainId] ??
      currentChainState.chainId
    const updatedNetwork =
      updatedChainId !== currentChainState.chainId
        ? NETWORK_MAP[currentChainState.network]
        : currentChainState.network

    const updatedWalletChainName = WALLET_CHAIN_NAME_MAINNET_TESTNET_MAP?.[currentChainState.walletChainName] ??
      currentChainState.walletChainName

    // eslint-disable-next-line prefer-destructuring
    const updatedChainName = updatedChainId.split('-')[0]

    const network = NetworkType[updatedNetwork];
    const currentWalletName = store.getState().walletName;

    if (connected) {
      disconnect();
    }

    store.setState({
      chains: network === NetworkType.testnet ? testnetChains : chains,
      assetsLists: network === NetworkType.testnet ? testnetAssetsLists : assetsLists,
    })

    if (currentWalletName) {
      store.getState().connect(currentWalletName);
    }

    setCurrentChainState({
      ...currentChainState,
      chainName: updatedChainName,
      network,
      chainId: updatedChainId,
      walletChainName: updatedWalletChainName,
    })

    const [defaultFrom, defaultTo] = defaultTokens[NetworkType[updatedNetwork]][updatedWalletChainName]
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
      }]

    setTokenSwapState(newState)

    // Await disconnect()
  }

  return (
    <>
      <Switch
        id="network"
        isChecked={currentChainState.network === NetworkType.testnet}
        onChange={changeNetwork}
      />
    </>
  )
}

export default NetworkSwitch
