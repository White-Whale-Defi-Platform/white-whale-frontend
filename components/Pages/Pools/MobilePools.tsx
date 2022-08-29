import { Flex, Button, VStack, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Spacer } from '@chakra-ui/react'
import { Pool } from './PoolsTable'
import PoolName from './PoolName'

type Props = {
    pools: Pool[]
}

const MobilePools = ({ pools }: Props) => {
    return (
        <VStack width="full" display={['flex', 'none']} gap={8}>
            {
                pools.map(pool => (
                    <VStack key={pool?.pool} padding={10} width={["full", "1160px"]}
                        background="#1C1C1C"
                        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                        borderRadius="30px"
                        justifyContent="center"
                    >
                        <HStack width="full" justifyContent="space-between">
                            <Text color="brand.200"> Pool</Text>
                            <Text color="brand.200"> APY</Text>
                        </HStack>

                        <HStack width="full" justifyContent="space-between">
                            <PoolName
                                poolId={pool?.pool}
                                token1Img={pool.token1Img}
                                token2Img={pool?.token2Img}
                            />
                            <Text color="brand.200"> coming soon</Text>
                        </HStack>

                        <HStack height="24px" />

                        <HStack width="full" justifyContent="space-between">
                            <Text color="brand.200"> Total Liquidity</Text>
                            <Text color="brand.200"> 24h volume</Text>
                        </HStack>

                        <HStack width="full" justifyContent="space-between">
                            <Text > $ {pool?.totalLiq}</Text>
                            <Text > coming soon</Text>
                        </HStack>

                        <HStack height="24px" />

                        <Button
                            variant="outline"
                            size="sm"
                            width="full"
                            onClick={() => pool?.cta()}
                        >
                            Manage Liquidity
                        </Button>


                    </VStack>
                ))
            }
        </VStack>
    )
}

export default MobilePools