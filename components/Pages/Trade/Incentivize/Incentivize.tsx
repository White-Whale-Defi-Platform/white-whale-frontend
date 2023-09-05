import { FC, useEffect, useMemo } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import PositionsOverview from 'components/Pages/Trade/Incentivize/PositionsOverview'
import { useChains } from 'hooks/useChainInfo'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useQueryPoolsLiquidity } from 'queries/useQueryPoolsLiquidity'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Create from 'components/Pages/Trade/Incentivize/Create'

const Incentivize: FC = () => {
  const router: NextRouter = useRouter()
  const chains: Array<any> = useChains()

  const { chainId } = useRecoilValue(walletState)
  const { data: poolList } = usePoolsListQuery()

  const poolId = useMemo(() => (router.query.poolId as string) ?? poolList?.pools[0].pool_id,
    [poolList])
  const chainIdParam = router.query.chainId as string
  const currentChain = chains.find((row) => row.chainId === chainId)

  const client = useCosmwasmClient(chainId)

  useEffect(() => {
    if (currentChain) {
      const pools = poolList?.pools
      if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
        router.push(`/${currentChain.label.toLowerCase()}/pools`)
      } else {
        router.push(`/${currentChain.label.toLowerCase()}/pools/incentivize?poolId=${poolId}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId, poolList, currentChain])

  const [pools] = useQueriesDataSelector(useQueryPoolsLiquidity({
    refetchInBackground: false,
    pools: poolList?.pools,
    client,
  }))

  const myFlows = useMemo(() => {
    if (!pools || !poolId) {
      return []
    }

    const flows = pools.find((p) => p.pool_id === poolId)
    return flows?.liquidity?.myFlows || []
  }, [pools, poolId])

  return (
    <VStack
      minWidth={{ base: '100%',
        md: '880' }}
      alignItems="center"
      padding={5}
    >
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}
        paddingX={{ base: 4 }}
      >
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon />}
          onClick={() => router.push(`/${chainIdParam}/pools`)}
        />
        <Text as="h2" fontSize="24" fontWeight="900">
          Manage Incentives
        </Text>
      </HStack>

      <Box
        background={'#1C1C1C'}
        padding={[6, 12]}
        paddingTop={[10]}
        borderRadius="30px"
        width={['full']}
      >
        <Box
          border="2px"
          borderColor="whiteAlpha.200"
          borderRadius="3xl"
          pt="8"
          maxH="fit-content"
        >
          <Tabs variant="brand">
            <TabList justifyContent="center" background={'#1C1C1C'}>
              <Tab>Overview</Tab>
              <Tab>Create</Tab>
            </TabList>
            <TabPanels p={4}>
              <TabPanel padding={4}>
                <PositionsOverview flows={myFlows} poolId={poolId} />
              </TabPanel>
              <TabPanel padding={4}>
                <Create poolId={poolId} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </VStack>
  )
}

export default Incentivize
