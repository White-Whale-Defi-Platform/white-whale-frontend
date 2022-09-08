import { Button, Flex, Text, VStack, Box, HStack, Image } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import { useRouter } from "next/router";
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import FallbackImage from 'components/FallbackImage'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'
import Loader from '../../Loader';
import { fromChainAmount, formatPrice } from "libs/num";

import MyPoolsTable from './MyPoolsTable'
import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools';


type Props = {

}

const Pools: FC<Props> = () => {
    const router = useRouter()
    const { data: poolList } = usePoolsListQuery()

    const [pools, isLoading, isError] = useQueriesDataSelector(
        useQueryMultiplePoolsLiquidity({
            refetchInBackground: false,
            pools: poolList?.pools,
        })
    )


    const myPools = useMemo(() => {
        if (!pools) return []

        return pools
            .filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
            .map(pool => ({
                pool: pool?.pool_id,
                token1Img: pool.pool_assets?.[0].logoURI,
                token2Img: pool.pool_assets?.[1].logoURI,
                myPosition: formatPrice(pool?.liquidity?.providedTotal?.dollarValue),
                apr: "coming soon",
                volume24hr: "coming soon",
                totalLiq: formatPrice(pool.liquidity.available.total.dollarValue),
                cta: () => router.push(`/pools/manage_liquidity?poolId=${pool?.pool_id}`)
            }))
    }, [pools])

    const allPools = useMemo(() => {
        if (!pools) return []

        const myPoolsId = myPools.map(({pool}) => pool)

        

        return pools
            .map(pool => ({
                pool: pool?.pool_id,
                token1Img: pool.pool_assets?.[0].logoURI,
                token2Img: pool.pool_assets?.[1].logoURI,
                apr: "coming soon",
                volume24hr: "coming soon",
                totalLiq: formatPrice(pool.liquidity.available.total.dollarValue),
                cta: () => router.push(`/pools/new_position?from=${pool.pool_assets?.[0].symbol}&to=${pool.pool_assets?.[1].symbol}`),
            }))
            .filter(item => !myPoolsId.includes(item.pool))
    }, [pools, myPools])

    // if (isLoading || pools === undefined)
    //     return <Loader />

    return (
        <VStack width={{ base: '100%', md: '1160px' }} alignItems="center" margin="auto">

            <Box>
                <HStack justifyContent="space-between" width="full" paddingY={10}>
                    <Text as="h2" fontSize="24" fontWeight="700">My Pools</Text>
                    <Button variant="primary" size="sm" onClick={() => router.push(`/pools/new_position`)}>New Position</Button>
                </HStack>
                <MyPoolsTable pools={myPools} isLoading={isLoading} />
                <MobilePools pools={myPools} />
            </Box>

            <Box>
                <HStack justifyContent="space-between" width="full" paddingY={10}>
                    <Text as="h2" fontSize="24" fontWeight="700">All Pools</Text>
                </HStack>
                <AllPoolsTable pools={allPools} isLoading={isLoading} />
                <MobilePools pools={allPools}  ctaLabel="Add Liquidity" />
            </Box>

        </VStack>
    )
}

export default Pools