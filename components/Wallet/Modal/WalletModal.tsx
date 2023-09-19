import React from 'react'
import { isMobile } from 'react-device-detect';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react'
import { WalletModalProps } from '@cosmos-kit/core'
import WalletConnectButton from 'components/Wallet/Modal/WalletConnectButton'
import { useChainInfos } from 'hooks/useChainInfo';
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState';

export enum WalletType {
  keplrExtension = 'keplr-extension',
  keplrMobile = 'keplr-mobile',
  terraExtension = 'station-extension',
  shellExtension = 'shell-extension',
  leapExtension = 'leap-extension',
  leapMobile = 'leap-cosmos-mobile',
  cosmoStationExtension = 'cosmostation-extension',
  cosmoStationMobile = 'cosmostation-mobile',
  leapSnap = 'leap-metamask-cosmos-snap'
}

function WalletModal({ isOpen, setOpen, walletRepo }: WalletModalProps) {
  const { chainId } = useRecoilValue(chainState)
  const chainInfos: any = useChainInfos()
  const snap = Boolean(chainInfos.find((elem) => elem.chainId == chainId && elem.coinType == 118))

  function onCloseModal() {
    if (isOpen) {
      setOpen(false)
    }
  }
  // @ts-ignore
  if (window.debugLogsEnabled) {
    console.log('Wallets: ')
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

              // @ts-ignore
              if (window.debugLogsEnabled) {
                console.log(wallet)
              }

              const { connect, walletName } = wallet;
              // TODO diffentiate between connect buttons
              if (isMobile && !wallet.isModeExtension) {
                return (
                  <WalletConnectButton
                    key={walletName}
                    onCloseModal={onCloseModal}
                    connect={connect}
                    walletType={walletName as WalletType}
                  />
                )
              } else if (!isMobile && wallet.isModeExtension) {
                if (snap === false && walletName.toLowerCase().includes('metamask')) {
                  return null
                } else {
                  return (
                    <WalletConnectButton
                      key={walletName}
                      onCloseModal={onCloseModal}
                      connect={connect}
                      walletType={walletName as WalletType}
                    />
                  )
                }
              } else if (window.leap && isMobile && walletName.toLowerCase().includes('chainleap')) {
                return <WalletConnectButton
                  key={walletName}
                  onCloseModal={onCloseModal}
                  connect={connect}
                  walletType={walletName as WalletType}
                />
                // @ts-ignore
              } else if (window.cosmostation! && isMobile && walletName.toLowerCase().includes('chaincosmostation')) {
                return <WalletConnectButton
                  key={walletName}
                  onCloseModal={onCloseModal}
                  connect={connect}
                  walletType={walletName as WalletType}
                />
              }
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(WalletModal)
