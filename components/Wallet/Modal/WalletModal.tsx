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
import { ChainWalletBase, WalletModalProps } from '@cosmos-kit/core'
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
  cosmoStationMobile = 'cosmostation-mobile'
}

function WalletModal({ isOpen, setOpen, walletRepo }: WalletModalProps) {
  const { chainId } = useRecoilValue(chainState);
  const chainInfos: any = useChainInfos();
  const snap = Boolean(chainInfos.find((elem) => elem.chainId == chainId && elem.coinType == 118));

  function onCloseModal() {
    if (isOpen) {
      setOpen(false);
    }
  }

  function shouldRenderButton(wallet : ChainWalletBase) {
    const walletName = wallet.walletName
    const inApp = isMobile && window.leap && window.leap.mode === 'mobile-web'
    if (inApp && walletName === 'leap-extension') return true;
    if (!inApp && walletName.toLowerCase().includes('metamask') && !snap) return false;
    if (!inApp && isMobile && !wallet.isModeExtension) return true;
    if (!inApp && !isMobile && wallet.isModeExtension) return true;
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

              if (!shouldRenderButton(wallet)) return null

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
