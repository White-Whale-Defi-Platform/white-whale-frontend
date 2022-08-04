import { Button, Flex, Text, VStack, Box, HStack, Image } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import { useRouter } from "next/router";
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import FallbackImage from 'components/FallbackImage'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'



type Props = {

}

const Pools: FC<Props> = () => {
    const router = useRouter()
    const { data: poolList } = usePoolsListQuery()

    const [pools = [], isLoading, isError] = useQueriesDataSelector(
        useQueryMultiplePoolsLiquidity({
          refetchInBackground: false,
          pools: poolList?.pools,
        })
      )

    const myPools = useMemo(() => {

        return pools.filter(({liquidity}) => liquidity?.providedTotal?.tokenAmount > 0)

    },[pools])



    return (
        <VStack>
            <HStack justifyContent="space-between" width="full" paddingY={10} paddingX={4}>
                <Text as="h2" fontSize="24" fontWeight="700">My Pools</Text>
                <Button variant="primary" size="sm" onClick={() => router.push(`/pools/providelp`)}>Provide Liquidity</Button>
            </HStack>

            <Flex padding={10} width="1058px"
                background="#1C1C1C"
                boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                borderRadius="30px">


                <VStack width="full" color="white">
                    <Flex width="full">
                        <Text width="30%" textAlign="center" variant="light"> Pool </Text>
                        <Text width="15%" textAlign="right" variant="light"> Combined APR </Text>
                        <Text width="15%" textAlign="right" variant="light"> Total Liquidity </Text>
                        <Text width="20%" textAlign="right" variant="light"> 24h Volume </Text>
                    </Flex>

                    {
                        myPools.map(pool => (
                            <Flex
                                key={pool?.pool_id}
                                width="full"
                                alignItems="center"
                                borderBottom="1px solid"
                                borderBottomColor="whiteAlpha.300"
                                paddingY={5}
                            >
                                <HStack width="30%" alignItems="center">
                                    <HStack spacing="-1" >
                                        <Box
                                            bg="#252525"
                                            boxShadow="xl"
                                            borderRadius="full"
                                            // p="1"
                                            border="2px solid rgba(255, 255, 255, 0.1);"
                                            position="relative"
                                            zIndex="2"
                                        >
                                            <Image
                                                src={pool.pool_assets?.[0].logoURI}
                                                alt="logo-small" boxSize="3rem"
                                                fallback={<FallbackImage width="8" height='8' color={["#5DB7DE", "#343434"]} />} />
                                        </Box>
                                        <Box
                                            border="2px solid rgba(255, 255, 255, 0.1);"
                                            borderRadius="full"
                                            // p="1"
                                            style={{
                                                marginLeft: "-15px"
                                            }}
                                        >
                                            <Image
                                                src={pool.pool_assets?.[1].logoURI}
                                                alt="ust" boxSize="3rem"
                                                fallback={<FallbackImage width="8" height='8' color={["#FFE66D", "#343434"]} />}
                                            />

                                        </Box>
                                    </HStack>

                                    <Text textAlign="center" > {pool.pool_id} </Text>
                                </HStack>
                                <Text width="15%" textAlign="right" > 33.24% </Text>
                                <Text width="15%" textAlign="right" > $3.3M </Text>
                                <Text width="20%" textAlign="right" > $2,400 </Text>
                                <Box width="20%" textAlign="right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/pools/managelp?poolId=${pool?.pool_id}`)}
                                    >
                                        Add Liquidity
                                    </Button>
                                </Box>
                            </Flex>
                        ))
                    }




                </VStack>
            </Flex>
        </VStack>
    )
}

export default Pools