import { HStack, Image, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil'
import { chainState } from 'state/chainState'

const Logo = () => {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(chainState)
  const router = useRouter()
  return (
    <HStack alignItems="center" paddingTop={['1.5', '1.5', '0']}>
      <a
        onClick={async () => {
          setCurrentWalletState({
            ...currentWalletState,
            chainId: 'migaloo-1',
            walletChainName: 'migaloo',
          })
          await router.push('/migaloo/swap')
        }
        }
      >
        <Image
          src="/logos/logo.svg"
          alt="WhiteWhale Logo"
          boxSize={[8, 12]}
        />
      </a>
      <HStack display={['none', 'none', 'none', 'flex']} >
        <Text pl={2} fontSize="26" fontWeight="400">
          White
        </Text>
        <Text fontSize="26" fontWeight="700">
          Whale
        </Text>
      </HStack>
    </HStack>
  )
}

export default Logo
