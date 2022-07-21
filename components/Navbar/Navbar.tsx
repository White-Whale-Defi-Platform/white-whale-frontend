import React,{useState} from 'react'
import { Flex, Box, HStack, Image } from '@chakra-ui/react'
import Link from 'next/link';
import Wallet from '../Wallet/Wallet';
import { useConnectWallet } from 'hooks/useConnectWallet'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import Card from '../Card';
import NavbarLink from './NavbarLink';
import Logo from './Logo';


const Navbar = () => {

  // const [slectedChain, setSelectedChain] = useState("uni-1")

  const { mutate: connectWallet } = useConnectWallet()
  const [{ key }, setWalletState] = useRecoilState(walletState)


  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
      chainId: null
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
      py="40px"
    // px={{ base: '4', md: '10' }}÷
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
          {links.map(({lable, link}) => (
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
    </Box>
  )
}

export default Navbar