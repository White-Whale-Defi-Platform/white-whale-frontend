import React from 'react'

import { HStack, Image, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useRecoilState } from 'recoil'
import { chainState } from 'state/atoms/chainState'

const Logo = () => {
  const [currentWalletState, setCurrentWalletState] = useRecoilState(chainState)
  return (
    <HStack alignItems="center">
      <Link href="/">
        <a
          onClick={() =>
            setCurrentWalletState({
              ...currentWalletState,
              chainId: 'migaloo-1',
            })
          }
        >
          <Image
            src="/logos/logo.svg"
            alt="WhiteWhale Logo"
            boxSize={[8, 12]}
          />
        </a>
      </Link>
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
