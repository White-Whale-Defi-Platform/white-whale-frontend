import { useCallback } from 'react'

import { Button, HStack, Image, Text } from '@chakra-ui/react'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import LeapSnapIcon from 'components/icons/LeapSnapIcon'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { ACTIVE_NETWORKS } from 'constants/networks'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

interface Props {
  onCloseModal: () => void
  walletType?: WalletType
  connect?: () => void
}

export const WalletConnectButton = ({ onCloseModal, connect, walletType }: Props) => {
  const { network } = useRecoilValue(chainState)
  const getKeplrChains = async (chains: Array<string>) => {
    const registry = await (await fetch('https://keplr-chain-registry.vercel.app/api/chains')).json()
    const toAdd = []
    Object.values(registry.chains).map((elem:any) => {
      if (chains.includes(elem.chainId)) {
        toAdd.push(elem)
      }
    })
    return toAdd
  }
  const setWallet = useCallback(async () => {
    if (walletType === WalletType.keplrExtension && window.keplr) {
      const keplrChains = await getKeplrChains(Object.values(ACTIVE_NETWORKS[network]))
      for (let i = 0; i < keplrChains.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await window.keplr.experimentalSuggestChain(keplrChains[i])
      }
    }

    connect()
    onCloseModal()
  }, [onCloseModal, connect])

  const renderContent = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return 'Keplr Wallet'
      case WalletType.keplrMobile:
        return 'Keplr Wallet'
      case WalletType.terraExtension:
        return 'Terra Station'
      case WalletType.cosmoStationExtension:
        return 'Cosmostation'
      case WalletType.cosmoStationMobile:
        return 'Cosmostation'
      case WalletType.shellExtension:
        return 'Shell Wallet'
      case WalletType.leapExtension:
        return 'Leap Wallet'
      case WalletType.leapMobile:
        return 'Leap Wallet'
      case WalletType.leapSnap:
        return 'Leap Metamask Snap'
      default:
        return null
    }
  }

  const walletConnectIcon = (
    <Image
      src={'/logos/wallet-connect-icon.png'}
      width="auto"
      maxW="1.5rem"
      maxH="1.5rem"
      alt="token1-img"
    />
  )

  const renderIcon = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return <KeplrWalletIcon />
      case WalletType.keplrMobile:
        return walletConnectIcon
      case WalletType.terraExtension:
        return <img src="/logos/station-icon.png" width={'27px'} />
      case WalletType.cosmoStationExtension:
        return <CosmostationWalletIcon />
      case WalletType.cosmoStationMobile:
        return walletConnectIcon
      case WalletType.shellExtension:
        return <img src="/logos/shell-icon.png" width={'27px'} />
      case WalletType.leapExtension:
        return <LeapWalletIcon />
      case WalletType.leapMobile:
        return walletConnectIcon
      case WalletType.leapSnap:
        return <LeapSnapIcon />
      default:
        return null
    }
  }

  return (
    <Button variant="wallet" onClick={() => setWallet()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>{renderContent()}</Text>
        {renderIcon()}
      </HStack>
    </Button>
  )
}

export default WalletConnectButton
