import React from 'react'

import { HStack, Image, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

const Logo = () => {
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)
  const router = useRouter()
  return (
    <HStack alignItems="center">
      <a
        onClick={async () => {
          setCurrentWalletState({
            ...currentWalletState,
            chainId: 'migaloo-1',
          })
          await router.push('/migaloo/swap')
        }
        }
      >
        <Image src="/img/logo.svg" alt="WhiteWhale Logo" boxSize={[8, 12]} />
      </a>
      <HStack display={['none', 'flex']}>
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
