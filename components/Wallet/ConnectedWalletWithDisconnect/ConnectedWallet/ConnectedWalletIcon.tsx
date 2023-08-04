import React from 'react'

import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'
import TerraExtensionIcon from 'components/icons/TerraExtensionIcon'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'
import { useChain } from '@cosmos-kit/react-lite'
import { WalletType } from 'components/Wallet/Modal/WalletModal'

function ConnectedWalletIcon() {
  const { chainName } = useRecoilValue(chainState)
  const { wallet, chainWallet } = useChain(chainName)
  console.log(wallet.name, chainWallet.chainLogoUrl)
  switch (wallet.name) {
    case WalletType.keplrExtension || WalletType.keplrMobile:
      return <KeplrWalletIcon />
    case WalletType.leapExtension || WalletType.leapMobile:
      return <LeapWalletIcon />
    case WalletType.cosmoStationExtension || WalletType.cosmoStationMobile:
      return <CosmostationWalletIcon />
    case WalletType.terraExtension:
      return <TerraExtensionIcon />
    default:
      return <></>
  }
}

export default ConnectedWalletIcon
