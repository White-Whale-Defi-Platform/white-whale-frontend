import { useCallback } from 'react'

import { Button, HStack, Text, useToast } from '@chakra-ui/react'
import { useConfig } from '@quirks/react'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import { ACTIVE_NETWORKS } from 'constants/networks'
import Image from 'next/image'
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
  const { wallets } = useConfig();

  const getKeplrChains = async (chains: Array<string>) => {
    const response = await fetch('https://keplr-chain-registry.vercel.app/api/chains');
    const registry = await response.json();
    return Object.values(registry.chains).filter((elem: { chainId: string }) => chains.includes(elem.chainId));
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
  const setWallet = useCallback(() => {
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
      case WalletType.okxwallet:
        return 'OKX Wallet'
      default:
        return null
    }
  }

  const renderIcon = () => {
    const wallet = wallets.find((wallet) => wallet.options.wallet_name === walletType);

    if (!wallet) {
      return null;
    }

    if (wallet.options.connection_type === 'wallet_connect') {
      return <WalletConnectIcon />
    }

    return <Image width={24} height={24} src={wallet.logoDark ?? wallet.logoLight} alt={wallet.options.pretty_name} />;
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
