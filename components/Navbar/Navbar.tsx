import React from 'react'
import {
  Flex, Box, HStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link';
import Wallet from '../Wallet/Wallet';
import { useConnectWallet } from 'hooks/useConnectWallet'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import Card from '../Card';
import NavbarLink from './NavbarLink';
import Logo from './Logo';
import DrawerLink from './DrawerLink';
import BurgerIcon from 'components/icons/BurgerIcon';


const Navbar = ({ }) => {

  // const [selectedChain, setSelectedChain] = useState("uni-1")

  const { mutate: connectWallet } = useConnectWallet()
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
    {
      lable: "Vaults",
      link: "/vaults"
    },
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
            onConnect={connectWallet}
            onDisconnect={resetWalletConnection}
          // onChange={setSelectedChain}

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
              onConnect={connectWallet}
              onDisconnect={resetWalletConnection}
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