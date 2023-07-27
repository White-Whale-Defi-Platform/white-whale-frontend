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
    if (window && !window?.shellwallet) {
      alert('Please install Shell Wallet extension and refresh the page.')
      return
    }

    if (chainInfo !== undefined) {
      await window.shellwallet?.experimentalSuggestChain(chainInfo)
      await window.shellwallet.enable(currentWalletState.chainId)
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
  }

  const setShellAndConnect = () => {
    setCurrentWalletState({
      ...currentWalletState,
      activeWallet: 'shellwallet',
    })
    localStorage.removeItem('__terra_extension_router_session__')
    connectShell()
  }

  return { connectShell, setShellAndConnect }
}
