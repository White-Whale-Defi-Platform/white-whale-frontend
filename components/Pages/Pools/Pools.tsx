import { Button, Flex, Text, VStack, Box, HStack, Image } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import { useRouter } from "next/router";
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import FallbackImage from 'components/FallbackImage'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'
import Loader from '../../Loader';
import { fromChainAmount, formatPrice } from "libs/num";

import PoolsTable from './PoolsTable'


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
                totalLiq: formatPrice(pool.liquidity.available.total.dollarValue),
                cta: () => router.push(`/pools/manage_liquidity?poolId=${pool?.pool_id}`)
            }))
    }, [pools])

    return (
        <VStack width={{ base: '100%', md: '1058px' }} alignItems="center" padding={5} margin="auto">
            <HStack justifyContent="space-between" width="full" paddingY={10} paddingX={4}>
                <Text as="h2" fontSize="24" fontWeight="700">My Pools</Text>
                <Button variant="primary" size="sm" onClick={() => router.push(`/pools/new_position`)}>New position</Button>
            </HStack>

            <Flex padding={10} width={["full", "1058px"]}
                background="#1C1C1C"
                boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                borderRadius="30px">


                <VStack width="full" color="white">

                    {

                        (isLoading || pools === undefined)
                            ?
                            <Loader />
                            : (!myPools.length) && (
                                <Text py={10} color="white"> Your active liquidity positions will appear here. </Text>
                            )
                    }

                    <PoolsTable pools={myPools} />}

                </VStack>
            </Flex>
        </VStack>
    )
}

export default Pools