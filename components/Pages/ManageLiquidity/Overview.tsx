import { Box, VStack, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { usePoolFromListQueryById } from "queries/usePoolsListQuery"
import usePositions from "./hooks/usePositions"
import { Action } from "./Action"
import { Positions } from "./Positions"
import { Rewards } from "./Rewards"

type Props = {
    poolId: string;
}


const Overview = ({ poolId }: Props) => {

    const [pool] = usePoolFromListQueryById({ poolId })
    const { data: positions = [] } = usePositions(pool?.staking_address, poolId)

    const tableData = useMemo(() => {
        return positions?.map((item) => ({
            ...item,
            action: <Action item={item} poolId={poolId} />
        }))
    }, [positions])

    return (
        <VStack alignItems="flex-start" gap="16px">
            <Rewards />

            {
                positions.length > 0 ? (
                    <Box backgroundColor="#151515" width="full" borderRadius="15px">
                        <Positions positions={tableData} />
                    </Box>
                ) : (
                    <Box width="full" textAlign="center" >
                        <Text>No open positions</Text>
                    </Box>
                )

            }


        </VStack>
    )
}

export default Overview