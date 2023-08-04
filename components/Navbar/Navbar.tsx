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
import { BONDING_ENABLED_CHAIN_IDS } from 'constants/bonding_contract'
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
  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

  const links = [
    {
      label: 'Dashboard',
      link: `/${currentChainName}/dashboard`,
    },
    {
      label: 'Swap',
      link: `/${currentChainName}/swap`,
    },
    {
      label: 'Pools',
      link: `/${currentChainName}/pools`,
    },
    {
      label: 'Vaults',
      link: `/${currentChainName}/vaults`,
    },
    {
      label: 'Flashloan',
      link: `/${currentChainName}/flashloan`,
    },
    {
      label: 'Bridge',
      link: 'https://tfm.com/bridge',
    },
  ]

  const resetWalletConnection = () => {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
      network,
      chainId,
      activeWallet: null,
    })
    queryClient.clear()
    disconnect()
  }

  return (
    <Box
      width={'full'}
      py={{ base: '2', md: '10' }}
      px={{ base: '2', md: '10' }}
    >
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
        py="2"
        px="1"
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
          align="right"
          variant="ghost"
          color="white"
          icon={<BurgerIcon width="3rem" height="1rem" />}
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
