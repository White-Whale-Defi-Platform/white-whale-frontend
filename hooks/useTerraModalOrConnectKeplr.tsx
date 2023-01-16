import { useChainInfo } from 'hooks/useChainInfo'
import useConnectKeplr from 'hooks/useConnectKeplr'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

export default function useTerraModalOrConnectKeplr(onOpenModal) {
  const { chainId } = useRecoilValue(walletState)
  const [chainInfo] = useChainInfo(chainId)
  const { setKeplrAndConnect } = useConnectKeplr()

  const showTerraModalOrConnectKeplr = () => {
    onOpenModal()
    // chainInfo.label === 'Terra' ? onOpenModal() : setKeplrAndConnect()
  }

  return { showTerraModalOrConnectKeplr }
}
