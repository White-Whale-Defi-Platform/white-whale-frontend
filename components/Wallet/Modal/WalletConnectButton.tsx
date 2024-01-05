import { useCallback } from 'react'

import { Button, HStack, Text, useToast } from '@chakra-ui/react'
import CosmostationWalletIcon from 'components/Icons/CosmostationWalletIcon'
import KeplrWalletIcon from 'components/Icons/KeplrWalletIcon'
import LeapSnapIcon from 'components/Icons/LeapSnapIcon'
import LeapWalletIcon from 'components/Icons/LeapWalletIcon'
import NinjiWalletIcon from 'components/Icons/NinjiWalletIcon'
import { ShellWalletIcon } from 'components/Icons/ShellWalletIcon'
import { TerraStationWalletIcon } from 'components/Icons/TerraStationWalletIcon'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
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
    const response = await fetch('https://keplr-chain-registry.vercel.app/api/chains');
    const registry = await response.json();
    return Object.values(registry.chains).filter((elem : {chainId: string}) => chains.includes(elem.chainId));
  }
  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1)
  const handleChainActivationError = (chainName: string, toast) => {
    const capitalizedChainName = capitalizeFirstLetter(chainName);
    console.error(`${capitalizedChainName} not activated`);
    toast({
      title: `${capitalizedChainName} not activated`,
      description: `Please add ${capitalizedChainName} to your wallet.`,
      status: 'error',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    });
  }
  const setWallet = useCallback(async () => {
    let error = false
    if (walletType === WalletType.keplrExtension && window.keplr) {
      const connected = (await window.keplr?.getChainInfosWithoutEndpoints()).map((elem) => elem.chainId)
      const keplrChains: any[] = await getKeplrChains(Object.values(ACTIVE_NETWORKS[network]))
      for (const chain of keplrChains) {
        if (!connected?.includes(chain.chainId)) {
        // eslint-disable-next-line no-await-in-loop
          await window.keplr.experimentalSuggestChain(chain)
        }
      }
    }
    if ((walletType === WalletType.terraExtension || walletType === WalletType.keplrExtension)) {
      const windowConnection = walletType === WalletType.terraExtension ? (window.station?.keplr) : (window?.keplr)
      try {
        await (windowConnection.getKey(chainId))
      } catch (e) {
        error = true
        console.error(`${chainId} not activated`)
        handleChainActivationError(chainName, toast);
      }
      if (walletType === WalletType.terraExtension && chainName.includes('injective')) {
        error = true
      }
    }
    if (!error) {
      connect()
    }
    onCloseModal()
  }, [onCloseModal, connect, walletType])

  const renderContent = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return 'Keplr Wallet'
      case WalletType.keplrMobile:
        return 'Keplr Wallet'
      case WalletType.terraExtension:
        return 'Station'
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
      case WalletType.ninjiExtension:
        return 'Ninji Wallet'
      default:
        return null
    }
  }

  const renderIcon = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return <KeplrWalletIcon />
      case WalletType.keplrMobile:
        return <WalletConnectIcon />
      case WalletType.terraExtension:
        return <TerraStationWalletIcon/>
      case WalletType.cosmoStationExtension:
        return <CosmostationWalletIcon />
      case WalletType.cosmoStationMobile:
        return <WalletConnectIcon />
      case WalletType.shellExtension:
        return <ShellWalletIcon/>
      case WalletType.leapExtension:
        return <LeapWalletIcon />
      case WalletType.leapMobile:
        return <WalletConnectIcon />
      case WalletType.leapSnap:
        return <LeapSnapIcon />
      case WalletType.ninjiExtension:
        return <NinjiWalletIcon />
      default:
        return null
    }
  }

  return (
    <Button variant="wallet" onClick={() => setWallet()} bg={'#444444'}>
      <HStack justify="space-between" width="full">
        <Text>{renderContent()}</Text>
        {renderIcon()}
      </HStack>
    </Button>
  )
}

export default WalletConnectButton
