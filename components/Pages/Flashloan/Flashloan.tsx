import { FC, useEffect } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import FlashloanForm from './FlashloanForm'

const Flashloan: FC = () => {
  const { chainId } = useRecoilValue(walletState)
  const router = useRouter()
  const chains = useChains()
  const chainIdParam = router.query.chainId as string
  const currenChain = chains.find((row) => row.chainId === chainId)

  if (!currenChain || currenChain.label.toLowerCase() !== chainIdParam)
    return null

  return (
    <VStack width={{ base: '100%', md: '722px' }} alignItems="center">
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            Flashloan
          </Text>
        </HStack>
        <FlashloanForm />
      </Box>
    </VStack>
  )
}

export default Flashloan
