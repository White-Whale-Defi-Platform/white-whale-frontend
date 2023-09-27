import { useCallback } from 'react'

import { Button, HStack, Image, Text, Toast, useToast } from '@chakra-ui/react'
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
  const toast = useToast()
  const { network, chainId, chainName } = useRecoilValue(chainState)
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
    let err = false
    if (walletType === WalletType.keplrExtension && window.keplr) {
      const connected = (await window.keplr.getChainInfosWithoutEndpoints()).map((elem) => elem.chainId)
      const keplrChains = await getKeplrChains(Object.values(ACTIVE_NETWORKS[network]))
      for (const chain of keplrChains) {
        if (!connected.includes(chain.chainId)) {
        // eslint-disable-next-line no-await-in-loop
          await window.keplr.experimentalSuggestChain(chain)
        }
      }
    }
    if ((walletType === WalletType.terraExtension || walletType === WalletType.keplrExtension) && (chainId === 'injective-1' || chainId === 'columbus-5')) {
      const windowConn = walletType === WalletType.terraExtension ? window.station.keplr : window.keplr
      try {
        await (windowConn.getKey(chainId))
      } catch (e) {
        err = true
        console.error(`${chainId} not activated`)
        console.error(e)
        toast({
          title: `${chainName} not activated`,
          description: `Please add ${chainName} to your Wallet.`,
          status: 'error',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })
      }
    }
    if (!err) {
      connect()
    }
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
