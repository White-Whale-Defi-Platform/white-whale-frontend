import { Box, Text, VStack } from "@chakra-ui/react"
import { useMemo } from "react"
import { Action } from "./Action"
import usePositions from "./hooks/usePositions"
import useRewards from "./hooks/useRewards"
import { Positions } from "./Positions"
import { Rewards } from "./Rewards"
import ForceEpoch from "./ForceEpoch"

type Props = {
    poolId: string;
}


const Overview = ({ poolId }: Props) => {

    const { rewards, totalValue } = useRewards(poolId)
    const { data: positions = [] } = usePositions(poolId)

    const tableData = useMemo(() => {
        return positions?.map((item) => ({
            ...item,
            action: <Action item={item} poolId={poolId} />
        }))
    }, [positions])

    return (
        <VStack alignItems="flex-start" gap="16px" py={5}>
            <Rewards
                rewards={rewards}
                totalValue={totalValue}
            />

            <ForceEpoch 
                poolId={poolId}
            />

            {
                positions.length > 0 ? (
                    <Box backgroundColor="#151515" width="full" borderRadius="15px">
                        <Positions positions={tableData} />
                    </Box>
                ) : (
                    <Box width="full" textAlign="center" >
                        <Text color="whiteAlpha.700">No open positions</Text>
                    </Box>
                )

            }

        </VStack>
    )
}

export default Overview