import { useRecoilValue } from "recoil"

import { walletState } from "../state/atoms/walletAtoms"
import { useChainInfo } from "./useChainInfo"
import useWalletConnect from "./useWalletConnect"

export default function useTerraModalOrConnectKeplr (onOpen) {
  const {setKeplr} = useWalletConnect()
    const {chainId} = useRecoilValue(walletState)
    let [chainInfo] = useChainInfo(chainId)

  const showTerraModalOrConnectKeplr = () => {
    chainInfo.label === 'Terra' ? onOpen() :  setKeplr(chainId)
    return
  }

  return {showTerraModalOrConnectKeplr}
}
