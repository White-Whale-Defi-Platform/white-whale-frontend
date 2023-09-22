import { FC } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useChainInfos } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import FlashloanForm from './FlashloanForm'

const Flashloan: FC = () => {
  const { chainId } = useRecoilValue(chainState)
  const router = useRouter()
  const chainInfos : any = useChainInfos()
  const chainIdParam = router.query.chainId as string
  const currentChain = chainInfos.find((row: { chainId: string }) => row.chainId === chainId)

  if (!currentChain || currentChain.label.toLowerCase() !== chainIdParam) {
    return null
  }

  return (
    <VStack width={{ base: '100%',
      md: '722px' }} alignItems="center">
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700" paddingLeft={5}>
            Flashloan
          </Text>
        </HStack>
        <FlashloanForm />
      </Box>
    </VStack>
  )
}

export default Flashloan
