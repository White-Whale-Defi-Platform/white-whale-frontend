import { useWallet } from '@terra-money/wallet-provider'
import { useRecoilState, useSetRecoilState} from 'recoil'

import { walletState } from '../state/atoms/walletAtoms';
import useConnectKeplr from "./useConnectKeplr";
import useConnectStation from "./useConnectStation";

export default function useWalletConnect (onCloseModal) {
  const {connectKeplr, connectKeplrMemo} = useConnectKeplr()
  const {connectStation} = useConnectStation()
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)
  const {connect} = useWallet()

  const setKeplr = () => {
  
    setCurrentWalletState({...currentWalletState, activeWallet: 'keplr'})
    localStorage.removeItem('__terra_extension_router_session__')
    connectKeplrMemo()
  }
  const setTerraActiveAndConnect = (type, identifier) => {
    setCurrentWalletState({...currentWalletState, activeWallet: identifier})
    connect(type, identifier)
    onCloseModal()
  }

  return {connectKeplr, connectKeplrMemo, connectStation, setKeplr, setTerraActiveAndConnect}
}
