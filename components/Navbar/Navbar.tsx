import React from 'react'
import { useQueryClient } from 'react-query'
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useWallet } from '@terra-money/wallet-provider'
import BurgerIcon from 'components/icons/BurgerIcon'
import { useChains } from 'hooks/useChainInfo'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

import Card from '../Card'
import WalletModal from '../Wallet/Modal/Modal'
import Wallet from '../Wallet/Wallet'
import DrawerLink from './DrawerLink'
import Logo from './Logo'
import NavbarPopper from './NavbarPopper'
import bondingDisabledMenuLinks from './NavBondingDisabledMenu.json'
import menuLinks from './NavMenu.json'
import { BONDING_ENABLED_CHAIN_IDS } from 'constants/bondingContract'

export const links = [
  {
    label: 'Swap',
    link: '/swap',
  },
  {
    label: 'Pools',
    link: '/pools',
  },
  {
    label: 'Flashloan',
    link: '/flashloan',
  },
  {
    label: 'Vaults',
    link: '/vaults',
  },
  {
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    label: 'Bridge',
    link: 'https://tfm.com/bridge',
  },
]
const Navbar = () => {
  const { disconnect } = useWallet()
  const [{ key, chainId, network }, setWalletState] =
    useRecoilState(walletState)
  const queryClient = useQueryClient()
  const chains: Array<any> = useChains()
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const resetWalletConnection = () => {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
      network: network,
      chainId,
      activeWallet: null,
    })
    queryClient.clear()
    disconnect()
  }

  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

  return (
    <Box py={{ base: '4', md: '10' }} px={{ base: '4', md: '10' }}>
      <Flex
        justifyContent="space-between"
        mx="auto"
        maxWidth="container.xl"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
      >
        <Box flex="1">
          <Logo />
        </Box>
        <Card paddingX={10} gap={6}>
          {(BONDING_ENABLED_CHAIN_IDS.includes(chainId)
            ? menuLinks
            : bondingDisabledMenuLinks
          ).map((menu) => (
            <NavbarPopper
              key={menu.label}
              menu={menu}
              currentChainName={currentChainName}
              chainId={chainId}
            />
          ))}
        </Card>
        <HStack flex="1" spacing="6" justify="flex-end">
          <Wallet
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onDisconnect={resetWalletConnection}
            disconnect={disconnect}
            isOpenModal={isOpenModal}
            onOpenModal={onOpenModal}
            onCloseModal={onCloseModal}
            onPrimaryButton={false}
          />
          <WalletModal
            isOpenModal={isOpenModal}
            onCloseModal={onCloseModal}
            chainId={chainId}
          />
        </HStack>
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        py="4"
        display={{ base: 'flex', md: 'none' }}
      >
        <Logo />
        <Wallet
          connected={Boolean(key?.name)}
          walletName={key?.name}
          onDisconnect={resetWalletConnection}
          disconnect={disconnect}
          onOpenModal={onOpenModal}
        />
        <IconButton
          aria-label="Open drawer"
          variant="ghost"
          color="white"
          icon={<BurgerIcon width="1rem" height="1rem" />}
          onClick={onOpen}
          display={{ base: 'block', md: 'none' }}
          _focus={{
            bg: 'none',
          }}
          _active={{
            bg: 'none',
          }}
          _hover={{
            boxShadow: 'none',
          }}
        >
          Open
        </IconButton>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody as={VStack} alignItems="flex-start">
            {links.map(({ label, link }) => (
              <DrawerLink
                key={label}
                text={label}
                href={link}
                onClick={onClose}
              />
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default Navbar
