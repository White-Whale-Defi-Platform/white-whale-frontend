import { FC, useEffect } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import FlashloanForm from './FlashloanForm'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const Flashloan: FC<Props> = () => {
  const { address, chainId } = useRecoilValue(walletState)
  const router = useRouter()
  const chains = useChains()
  const chainIdParam = router.query.chainId as string

  useEffect(() => {
    if (chainId) {
      const currenChain = chains.find((row) => row.chainId === chainId)
      if (currenChain && currenChain.label.toLowerCase() !== chainIdParam) {
        router.push(`/${currenChain.label.toLowerCase()}/flashloan`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chainIdParam])
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
