import {
Box,   Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex, HStack,
  IconButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useWallet } from '@terra-money/wallet-provider';
import BurgerIcon from 'components/icons/BurgerIcon';
import React from 'react'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

import Card from '../Card';
import WalletModal from '../Wallet/Modal/Modal';
import Wallet from '../Wallet/Wallet';
import DrawerLink from './DrawerLink';
import Logo from './Logo';
import NavbarLink from './NavbarLink';


const Navbar = ({ }) => {

  // const [selectedChain, setSelectedChain] = useState("uni-1")
  const {disconnect} = useWallet()
  const [{ key, chainId }, setWalletState] = useRecoilState(walletState)
  const { isOpen, onOpen, onClose } = useDisclosure();


  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
      chainId: chainId
    })
    disconnect()
  }
  const links = [
    {
      lable: "Swap",
      link: "/swap"
    },
    {
      lable: "Pools",
      link: "/pools"
    },
    // {
    //   lable: "Vault",
    //   link: "/vault"
    // },
    // {
    //   lable: "Chart",
    //   link: "/chart"
    // },
  ]


  return (
    <Box
      py={{ base: '4', md: '10' }}
      px={{ base: '4', md: '10' }}
    // borderBottomWidth="2px"
    // borderColor="brand.100"
    >
      <Flex
        justifyContent="space-between"
        mx="auto"
        maxWidth="container.xl"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
      >
        <Box flex="1" >
          <Logo />
        </Box>
        <Card paddingX={10} gap={6}>
          {links.map(({ lable, link }) => (
            <NavbarLink key={lable} text={lable} href={link} />
          ))}
        </Card>
        <HStack flex="1" spacing="6" justify="flex-end" py="3">
          <Wallet
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onDisconnect={resetWalletConnection}
            disconnect={disconnect}

          />
          {/* <SendLuna onDisconnect={resetWalletConnection} /> */}
          <WalletModal
            isOpen={isOpen}
            onClose={onClose}
            // onConnect={connectWallet}
/>
        </HStack>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        py="4"
        display={{ base: 'flex', md: 'none' }}
      >
        {/* <VStack width="full"> */}
          {/* <HStack justifyContent="space-between" width="full"> */}

            <Logo />
            <Wallet
              connected={Boolean(key?.name)}
              walletName={key?.name}
              onDisconnect={resetWalletConnection}
              disconnect={disconnect}
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
          {/* </HStack> */}

        {/* </VStack> */}
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody as={VStack} alignItems="flex-start">
            {links.map(({ lable, link }) => (
              <DrawerLink key={lable} text={lable} href={link} onClick={onClose} />
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </Box>
  )
}

export default Navbar
