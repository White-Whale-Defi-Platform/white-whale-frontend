import { useWallet } from '@terra-money/wallet-provider'
import { useSetRecoilState} from 'recoil'

import { activeWalletAtom } from "../state/atoms/activeWalletAtom";
import useConnectKeplr from "./useConnectKeplr";
import useConnectStation from "./useConnectStation";

export default function useWalletConnect () {
  const {connectKeplr} = useConnectKeplr()
  const {connectStation} = useConnectStation()
  const setActiveWallet = useSetRecoilState(activeWalletAtom)
  const {connect} = useWallet()

  const setKeplr = (chainId: string) => {
    setActiveWallet('keplr')
    connectKeplr(chainId)
  }
  const setTerraActiveAndConnect = (type, identifier) => {
    setActiveWallet(identifier)
    connect(type, identifier)
    return
  }

  return {connectKeplr, connectStation, setKeplr, setTerraActiveAndConnect}
}
