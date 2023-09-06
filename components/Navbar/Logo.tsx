import React from 'react'

import { HStack, Image, Text } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { chainState } from 'state/chainState'
import { useRouter } from 'next/router'
const Logo = () => {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(chainState)
  const router = useRouter()
  return (
    <HStack alignItems="center" paddingTop={['1.5','1.5','0']}>
        <a
          onClick={async() => {
            setCurrentWalletState({
              ...currentWalletState,
              chainId: 'migaloo-1'
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
      <HStack display={['none', 'flex', 'none','flex']} >
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
