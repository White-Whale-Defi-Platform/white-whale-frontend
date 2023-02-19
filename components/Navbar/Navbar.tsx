import React from 'react'

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
import NavbarLink from './NavbarLink'

const links = [
  {
    lable: 'Swap',
    link: '/swap',
  },
  {
    lable: 'Pools',
    link: '/pools',
  },
  {
    lable: 'Flashloan',
    link: '/flashloan',
  },
  {
    lable: 'Vaults',
    link: '/vaults',
  },
  // {
  //   lable: "Chart",
  //   link: "/chart"
  // },
]

const Navbar = ({}) => {
  const { disconnect } = useWallet()
  const [{ key, chainId, network, activeWallet }, setWalletState] =
    useRecoilState(walletState)
  const chains = useChains()
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
      network,
      chainId,
      activeWallet: null,
    })
    disconnect()
  }

  const currenChain = chains.find((row) => row.chainId === chainId)
  const currentChainName = currenChain?.label.toLowerCase()

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
          {links.map(({ lable, link }) => (
            <NavbarLink
              key={lable}
              text={lable}
              href={`/${currentChainName}${link}`}
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
            {links.map(({ lable, link }) => (
              <DrawerLink
                key={lable}
                text={lable}
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
