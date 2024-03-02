import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import { useConfig, useConnect } from '@quirks/react';
import WalletConnectButton from 'components/Wallet/Modal/WalletConnectButton';
import { useWalletModal } from 'hooks/useWalletModal';

export enum WalletType {
  keplrExtension = 'keplrextension',
  keplrMobile = 'keplrmobile',
  terraExtension = 'station-extension',
  shellExtension = 'shellextension',
  leapExtension = 'leapextension',
  leapMobile = 'leapmobile',
  leapSnap = 'leapmetamasksnap',
  cosmoStationExtension = 'cosmostationextention',
  cosmoStationMobile = 'cosmostation',
  ninjiExtension = 'ninjiextension',
  okxwallet = 'okxextension',
}

export const WalletModal = () => {
  const { open, closeModal } = useWalletModal();
  const { wallets } = useConfig();
  const { connect } = useConnect();

  return (
    <Modal isOpen={open} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="flex-start" width="full" gap={2}>
            {wallets.map((wallet) => {
              const { wallet_name: walletName } = wallet.options;

              return (
                <WalletConnectButton
                  key={walletName}
                  onCloseModal={closeModal}
                  connect={() => connect(walletName)}
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
