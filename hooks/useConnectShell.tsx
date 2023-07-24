import { GasPrice } from '@cosmjs/stargate'
import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider'
import { useChainInfo } from 'hooks/useChainInfo'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { OfflineSigningWallet } from 'util/wallet-adapters'

export default function useConnectShell() {
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)
  const [chainInfo] = useChainInfo(currentWalletState.chainId)
  const connectedWallet = useConnectedWallet()
  const { disconnect } = useWallet()

  const connectShell = async () => {
    if (connectedWallet) {
      disconnect()
    }
    // @ts-ignore
    if (window && !window?.shellwallet) {
      alert('Please install Shell Wallet extension and refresh the page.')
      return
    }

    try {
      if (chainInfo !== undefined) {
        // @ts-ignore
        await window.shellwallet?.experimentalSuggestChain(chainInfo)
        // @ts-ignore
        await window.shellwallet.enable(currentWalletState.chainId)
        // @ts-ignore
        const offlineSigner = await window.getOfflineSignerAutoShell(
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
          'shellwallet'
        )
        const [{ address }] = await offlineSigner.getAccounts()
        // @ts-ignore
        const key = await window.shellwallet.getKey(currentWalletState.chainId)
        /* successfully update the wallet state */
        setCurrentWalletState({
          key,
          address: address,
          client: wasmChainClient,
          chainId: currentWalletState.chainId,
          network: currentWalletState.network,
          status: WalletStatusType.connected,
          activeWallet: 'shellwallet',
        })
      }
    } catch (e) {
      throw e
    }
  }

  const setShellAndConnect = async () => {
    setCurrentWalletState({
      ...currentWalletState,
      activeWallet: 'shellwallet',
    })
    localStorage.removeItem('__terra_extension_router_session__')
    await connectShell()
  }

  return { connectShell, setShellAndConnect }
}
