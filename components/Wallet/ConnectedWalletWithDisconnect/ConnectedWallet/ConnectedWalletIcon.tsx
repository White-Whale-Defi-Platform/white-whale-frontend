import React from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import CosmostationWalletIcon from 'components/Icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/Icons/KeplrWalletIcon'
import LeapSnapIcon from 'components/Icons/LeapSnapIcon'
import LeapWalletIcon from 'components/Icons/LeapWalletIcon'
import NinjiWalletIcon from 'components/Icons/NinjiWalletIcon'
import TerraExtensionIcon from 'components/Icons/TerraExtensionIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export const ConnectedWalletIcon = () => {
  const { walletChainName } = useRecoilValue(chainState)
  const { wallet } = useChain(walletChainName)
  switch (wallet?.name) {
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
    case WalletType.ninjiExtension:
      return <NinjiWalletIcon />
    default:
      return <></>
  }
}

