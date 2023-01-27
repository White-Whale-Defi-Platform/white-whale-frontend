import { GasPrice } from '@cosmjs/stargate'
import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider'
import { useChainInfo } from 'hooks/useChainInfo'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { OfflineSigningWallet } from 'util/wallet-adapters'
import getChainName from '../libs/getChainName'
import { getSigningInjectiveClient } from 'injectivejs'

export default function useConnectKeplr() {
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)
  const [chainInfo] = useChainInfo(currentWalletState.chainId)
  const connectedWallet = useConnectedWallet()
  const { disconnect } = useWallet()

  const connectKeplr = async () => {
    if (connectedWallet) {
      disconnect()
    }
    if (window && !window?.keplr) {
      alert('Please install Keplr extension and refresh the page.')
      return
    }

    try {
      if (chainInfo !== undefined) {
        await window.keplr?.experimentalSuggestChain(chainInfo)
        await window.keplr.enable(currentWalletState.chainId)
        const offlineSigner = await window.getOfflineSignerAuto(
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
          'keplr'
        )
        const [{ address }] = await offlineSigner.getAccounts()
        const key = await window.keplr.getKey(currentWalletState.chainId)
        /* successfully update the wallet state */
        setCurrentWalletState({
          key,
          address: address,
          client: wasmChainClient,
          chainId: currentWalletState.chainId,
          network: currentWalletState.network,
          status: WalletStatusType.connected,
          activeWallet: 'keplr',
        })
      }
    } catch (e) {
      throw e
    }
  }

  const setKeplrAndConnect = () => {
    setCurrentWalletState({ ...currentWalletState, activeWallet: 'keplr' })
    localStorage.removeItem('__terra_extension_router_session__')
    connectKeplr()
  }

  return { connectKeplr, setKeplrAndConnect }
}
