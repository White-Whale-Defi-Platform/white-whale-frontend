import React from 'react'

import { useConnect } from '@quirks/react'
import CosmostationWalletIcon from 'components/Icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/Icons/KeplrWalletIcon'
import LeapSnapIcon from 'components/Icons/LeapSnapIcon'
import LeapWalletIcon from 'components/Icons/LeapWalletIcon'
import NinjiWalletIcon from 'components/Icons/NinjiWalletIcon'
import OKXWalletIcon from 'components/Icons/OKXWalletIcon'
import TerraExtensionIcon from 'components/Icons/TerraExtensionIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'

export const ConnectedWalletIcon = () => {
  const { wallet } = useConnect()

  switch (wallet?.options.wallet_name) {
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
    case WalletType.okxwallet:
      return <OKXWalletIcon />
    default:
      return <></>
  }
}

