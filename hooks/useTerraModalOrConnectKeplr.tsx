import { useRecoilValue } from "recoil"

import { walletState } from "../state/atoms/walletAtoms"
import { useChainInfo } from "./useChainInfo"
import useConnectKeplr from "./useConnectKeplr"

export default function useTerraModalOrConnectKeplr (onOpenModal) {
  const {chainId, network} = useRecoilValue(walletState)
  let [chainInfo] = useChainInfo(chainId)
  const {connectKeplr} = useConnectKeplr()

  const showTerraModalOrConnectKeplr = () => {
    if (chainInfo?.label){
      chainInfo.label === 'Terra' ?  onOpenModal() :  connectKeplr()
    }else{
      console.log('no chaininfo')
    }

    return
  }

  return {showTerraModalOrConnectKeplr}
}
