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
import Create from 'components/Pages/Trade/Incentivize/Create'
import { IncentivePositionsOverview } from 'components/Pages/Trade/Incentivize/IncentivePositionsOverview'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useQueryPoolsLiquidity } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useClients } from 'hooks/useClients'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { NextRouter, useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const Incentivize: FC = () => {
  const router: NextRouter = useRouter()
  const { chainName, walletChainName } = useRecoilValue(chainState)
  const { data: poolList } = usePoolsListQuery()

  const poolId = useMemo(() => (router.query.poolId as string) ?? poolList?.pools[0].pool_id,
    [poolList])

  const { cosmWasmClient } = useClients(walletChainName)

  useEffect(() => {
    if (chainName) {
      const pools = poolList?.pools
      if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
        router.push(`/${chainName}/pools`)
      } else {
        router.push(`/${chainName}/pools/incentivize?poolId=${poolId}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId, poolList, chainName])
  const [pools] = useQueriesDataSelector(useQueryPoolsLiquidity({
    refetchInBackground: false,
    pools: poolList?.pools,
    cosmWasmClient,
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
          onClick={() => router.push(`/${chainName}/pools`)}
        />
        <Text as="h2" fontSize="24" fontWeight="900">
          Manage Incentives
        </Text>
      </HStack>

      <Box
        background={kBg}
        padding={[6, 12]}
        paddingTop={[10]}
        borderRadius={kBorderRadius}
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
            <TabList justifyContent="center" background={'black'} borderRadius={10}>
              <Tab>Overview</Tab>
              <Tab>Create</Tab>
            </TabList>
            <TabPanels p={4}>
              <TabPanel padding={4}>
                <IncentivePositionsOverview flows={myFlows} poolId={poolId} />
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
