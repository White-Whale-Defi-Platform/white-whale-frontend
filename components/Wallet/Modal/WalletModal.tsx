import React from 'react';
import { isMobile } from 'react-device-detect';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import WalletConnectButton from 'components/Wallet/Modal/WalletConnectButton';
import { useChainInfos } from 'hooks/useChainInfo';
import { useRecoilValue } from 'recoil';
import { chainState } from 'state/chainState';

export enum WalletType {
  keplrExtension = 'keplr-extension',
  keplrMobile = 'keplr-mobile',
  terraExtension = 'station-extension',
  shellExtension = 'shell-extension',
  leapExtension = 'leap-extension',
  leapMobile = 'leap-cosmos-mobile',
  leapSnap = 'leap-metamask-cosmos-snap',
  cosmoStationExtension = 'cosmostation-extension',
  cosmoStationMobile = 'cosmostation-mobile',
  ninjiExtension = 'ninji-extension',
}

export const WalletModal = ({ isOpen, setOpen, walletRepo }) => {
  const { chainId } = useRecoilValue(chainState);
  const chainInfos: any = useChainInfos();
  const snap = Boolean(chainInfos.find((elem: { chainId: string; coinType: number; }) => elem.chainId === chainId && elem.coinType === 118));

  const onCloseModal = () => {
    if (isOpen) {
      setOpen(false);
    }
  }

  const shouldRenderButton = (wallet: { walletName: string, isModeExtension: boolean }) => {
    const { walletName } = wallet
    const inApp = isMobile && window.leap && window.leap.mode === 'mobile-web'
    const inj = chainId.includes('injective') && (walletName === WalletType.keplrExtension || walletName === WalletType.leapExtension || walletName === WalletType.ninjiExtension)
    if (inj) {
      return true
    } else if (chainId.includes('injective') && !inApp) {
      return false
    } else if (walletName === WalletType.ninjiExtension && !chainId.includes('injective')) {
      return false
    }
    if (inj && inApp && walletName === WalletType.leapExtension) {
      return true;
    }
    if (inApp && walletName === WalletType.leapExtension) {
      return true;
    }
    if (!inApp && walletName.toLowerCase().includes('metamask') && !snap) {
      return false;
    }
    if (!inApp && isMobile && !wallet.isModeExtension) {
      return true;
    }
    if (!inApp && !isMobile && wallet.isModeExtension) {
      return true;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="flex-start" width="full" gap={2}>
            {walletRepo?.wallets.map((wallet) => {
              const { connect, walletName } = wallet;
              if (!shouldRenderButton(wallet)) {
                return null
              }
              return (
                <WalletConnectButton
                  key={walletName}
                  onCloseModal={onCloseModal}
                  connect={connect}
                  walletType={walletName as WalletType}
                />
              );
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(WalletModal);
