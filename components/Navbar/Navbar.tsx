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

const Navbar = () => {
  const { chainId, chainName } = useRecoilValue(chainState)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const currentChainName = chainName

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

  return (
    <Box
      width={'full'}
      paddingLeft={{base: '1', md: '5'}}
      paddingRight={{base: '0', md: '5'}}
      paddingTop={{base: '2', md: '10'}}
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
        py={['0',"2"]}
        px={['0',"1"]}
        display={{ base: 'flex', md: 'none' }}
      >
        <Logo />
        <Wallet />
        <IconButton
          paddingTop={['3','3','0']}
          align="right"
          aria-label="Open drawer"
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
