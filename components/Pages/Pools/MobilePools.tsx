import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import PoolName from './components/PoolName'
import { Pool } from './types'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

type Props = {
  pools: Pool[]
  ctaLabel?: string
}

const MobilePools = ({ pools, ctaLabel }: Props) => {
  const router = useRouter()
  const { chainId, status} =
    useRecoilValue(walletState)
  const chains: Array<any> = useChains()
  const currentChain = chains.find(
    (row: { chainId: string }) => row.chainId === chainId
  )
  const currentChainName = currentChain?.label.toLowerCase()
  return (
    <VStack width="full" display={['flex', 'flex', 'flex','none']} gap={8}>
      {pools &&
        pools.map((pool) => (
          <VStack
            key={pool?.pool}
            padding={10}
            width={['full']}
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            justifyContent="center"
          >
            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{`Pool`}</Text>
              <Text color="brand.50">{`APR`}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <PoolName
                poolId={pool?.pool}
                token1Img={pool.token1Img}
                token2Img={pool?.token2Img}
              />
              <Text color="brand.50">{` ${Number(pool?.apr).toFixed(2)}`}</Text>
            </HStack>

            <HStack height="24px" />

            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{`Total Liquidity`}</Text>
              <Text color="brand.50">{`24h volume`}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <Text>{`$ ${Number(pool?.liquidity.available.total.dollarValue).toFixed(2)}`}</Text>
              <Text>{` ${Number(pool?.volume24hr).toFixed()}`}</Text>
            </HStack>

            <HStack height="24px" />

            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${currentChainName}/pools/manage_liquidity?poolId=${pool?.poolId}`)}
            >
              {ctaLabel || 'Manage'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${currentChainName}/pools/incentivize?poolId=${pool?.poolId}`)}
            >
              {'Incentivize'}
            </Button>
          </VStack>
        ))}
    </VStack>
  )
}

export default MobilePools
