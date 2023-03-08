import React from 'react'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import TerraExtensionIcon from 'components/icons/TerraExtensionIcon'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'
import WallectConnectIcon from 'components/icons/WalletConnectIcon'


function ConnectedWalletIcon({ connected }) {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)
  switch (currentWalletState?.activeWallet) {
    case 'keplr':
      return <KeplrWalletIcon />
    case 'leap':
      return <LeapWalletIcon />
    case 'cosmostation':
      return <CosmostationWalletIcon />
    case 'station':
      return <TerraExtensionIcon />
    case 'walletconnect':
      return <WallectConnectIcon />
    default:
      return <></>
  }
}

export default ConnectedWalletIcon
