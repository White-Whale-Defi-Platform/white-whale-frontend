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
    VStack
} from '@chakra-ui/react'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { FC, useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { useCosmwasmClient } from '../../../hooks/useCosmwasmClient'
import { useQueriesDataSelector } from '../../../hooks/useQueriesDataSelector'
import { useQueryMultiplePoolsLiquidity } from '../../../queries/useQueryPools'
import Create from './Create'
import Overview from './Overview'

const Incentivize: FC = () => {
    const router: NextRouter = useRouter()
    const poolId = router.query.poolId as string

    const {  chainId,  } = useRecoilValue(walletState)
    const { data: poolList } = usePoolsListQuery()
    const chainIdParam = router.query.chainId as string
    const client = useCosmwasmClient(chainId)

    const [pools] = useQueriesDataSelector(
        useQueryMultiplePoolsLiquidity({
            refetchInBackground: false,
            pools: poolList?.pools,
            client,
        })
    )

    const myFlows = useMemo(() => {

        if(!pools || !poolId) return []

        const flows = pools.find(p => p.pool_id === poolId)
        return flows?.liquidity?.myFlows || []

    },[pools, poolId])

    return (
        <VStack
            width='auto'
            minWidth={{ base: '100%', md: '800' }}
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
                background="#1C1C1C"
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
                        <TabList justifyContent="center" background="#1C1C1C">
                            <Tab>Overview</Tab>
                            <Tab>Create</Tab>
                        </TabList>
                        <TabPanels p={4}>
                            <TabPanel padding={4}>
                                <Overview flows={myFlows} poolId={poolId} />
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
