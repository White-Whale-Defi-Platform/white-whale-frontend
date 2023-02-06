import { GasPrice } from '@cosmjs/stargate'
import { useRecoilState } from 'recoil'
import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider'

import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { OfflineSigningWallet } from 'util/wallet-adapters'
import { useChainInfo } from 'hooks/useChainInfo'
import getChainName from '../libs/getChainName'
import { getSigningInjectiveClient } from 'injectivejs'

export default function useConnectCosmostation() {
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)
  let [chainInfo] = useChainInfo(currentWalletState.chainId)
  const connectedWallet = useConnectedWallet()
  const { disconnect } = useWallet()

  const connectCosmostation = async () => {
    if (connectedWallet) {
      disconnect()
    }
    if (window && !window?.cosmostation) {
      alert('Please install Cosmostation extension and refresh the page.')
      return
    }

    try {
      if (chainInfo !== undefined) {
        await window.cosmostation.providers.keplr?.experimentalSuggestChain(chainInfo)
        await window.cosmostation.providers.keplr.enable(currentWalletState.chainId)
        const offlineSigner = await window.cosmostation.providers.keplr.getOfflineSigner(
          currentWalletState.chainId
        )
        const wasmChainClient = await OfflineSigningWallet.connectWithSigner(
          currentWalletState.chainId,
          chainInfo.rpc,
          offlineSigner,
          currentWalletState.network,
          {
            gasPrice: GasPrice.fromString(
              `${chainInfo?.gasPriceStep?.low}${chainInfo?.feeCurrencies?.[0].coinMinimalDenom}`
            ),
          },
          'cosmostation'
        )
        const [{ address }] = await offlineSigner.getAccounts()
        const key = await window.cosmostation.providers.keplr.getKey(currentWalletState.chainId)
        /* successfully update the wallet state */
        setCurrentWalletState({
          key,
          address: address,
          client: wasmChainClient,
          chainId: currentWalletState.chainId,
          network: currentWalletState.network,
          status: WalletStatusType.connected,
          activeWallet: 'cosmostation',
        })
      }
    } catch (e) {
      throw e
    }
  }

  const setCosmostationAndConnect = () => {
    setCurrentWalletState({ ...currentWalletState, activeWallet: 'cosmostation' })
    localStorage.removeItem('__terra_extension_router_session__')
    connectCosmostation()
  }

  return { connectCosmostation, setCosmostationAndConnect }
}
