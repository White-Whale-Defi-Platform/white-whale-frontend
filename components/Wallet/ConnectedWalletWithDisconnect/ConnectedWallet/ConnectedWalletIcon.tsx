import React from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'
import TerraExtensionIcon from 'components/icons/TerraExtensionIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import LeapSnapIcon from '../../../icons/LeapSnapIcon'

function ConnectedWalletIcon() {
  const { walletChainName } = useRecoilValue(chainState)
  const { wallet } = useChain(walletChainName)

  switch (wallet.name) {
    case WalletType.keplrExtension || WalletType.keplrMobile:
      return <KeplrWalletIcon />
    case WalletType.leapExtension || WalletType.leapMobile:
      return <LeapWalletIcon />
    case WalletType.cosmoStationExtension || WalletType.cosmoStationMobile:
      return <CosmostationWalletIcon />
    case WalletType.terraExtension:
      return <TerraExtensionIcon />
    case WalletType.leapSnap:
      return <LeapSnapIcon />
    default:
      return <></>
  }
}

export default ConnectedWalletIcon
