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
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import BurgerIcon from 'components/icons/BurgerIcon'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { ACTIVE_BONDING_NETWORKS } from 'constants/index'

import Card from '../Card'
import Wallet from '../Wallet/Wallet'
import DrawerLink from './DrawerLink'
import Logo from './Logo'
import NavbarPopper from './NavbarPopper'
import bondingDisabledMenuLinks from './NavBondingDisabledMenu.json'
import menuLinks from './NavMenu.json'

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
  const { chainId, chainName } = useRecoilValue(chainState)

  const { isOpen, onOpen, onClose } = useDisclosure()

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
          {(ACTIVE_BONDING_NETWORKS.includes(chainId)
            ? menuLinks
            : bondingDisabledMenuLinks
          ).map((menu) => (
            <NavbarPopper
              key={menu.label}
              menu={menu}
              currentChainName={chainName}
              chainId={chainId}
            />
          ))}
        </Card>
        <HStack flex="1" spacing="6" justify="flex-end">
          <Wallet />
        </HStack>
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        py="4"
        display={{ base: 'flex', md: 'none' }}
      >
        <Logo />
        <Wallet />
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
