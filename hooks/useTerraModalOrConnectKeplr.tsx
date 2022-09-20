import { useRecoilValue } from "recoil"

import { walletState } from "state/atoms/walletAtoms"
import { useChainInfo } from "hooks/useChainInfo"
import useConnectKeplr from "hooks/useConnectKeplr"

export default function useTerraModalOrConnectKeplr (onOpenModal) {
  const {chainId} = useRecoilValue(walletState)
  let [chainInfo] = useChainInfo(chainId)
  const {setKeplrAndConnect} = useConnectKeplr()

  const showTerraModalOrConnectKeplr = () => {
    chainInfo.label === 'Terra' ?  onOpenModal() :  setKeplrAndConnect()
  }

  return {showTerraModalOrConnectKeplr}
}
