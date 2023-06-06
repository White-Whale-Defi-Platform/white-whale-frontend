import { Box, Button, Divider, HStack, Image, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react'
import { num } from '../../../libs/num';
import PositionsTable from './PositionsTable';
import { useClosePosition } from './hooks/useClosePosition';

type Props = {
    flows: any[]
    poolId: string
}

const STATES = ["all", "active", "upcoming", "over"]

const CloseAction = ({ poolId, flowId }) => {

    const close = useClosePosition({ poolId })

    return (
        <Button
            variant="outline"
            size="sm"
            isLoading={close?.isLoading}
            onClick={() => close?.submit({ flowId })}
        >
            Close
        </Button>
    )

}

const Token = ({ imgUrl }) => (
    <Box>
        <Image
            src={imgUrl}
            width="auto"
            maxW="1.6rem"
            maxH="1.6rem"
            alt="token1-img"
        />
    </Box>
)

const Positions = ({ flows, poolId }: Props) => {

    const [activeButton, setActiveButton] = useState("all");
    const [columnFilters, setColumnFilters] = useState([]);

    const positions = useMemo(() => {

        return flows.map((flow) => ({
            token: <Token imgUrl={flow?.token?.logoURI} />,
            id: flow.flowId,
            state: flow.state,
            // startDate: dayjs.unix(flow.startTime).format("YYYY/MM/DD"),
            // endDate: dayjs.unix(flow.endTime).format("YYYY/MM/DD"),
            startDate: flow.startTime,
            endDate: flow.endTime,
            value: num(flow.amount).div(10 ** 6).toNumber(),
            action: <CloseAction poolId={poolId} flowId={flow.flowId} />
        }))

    }, [flows])


    if (positions.length === 0) return (
        <Box width="full" textAlign="center" >
            <Text color="whiteAlpha.700">No open positions</Text>
        </Box>
    )

    return (
        <Box width="full" >
            <HStack
                margin="20px"
                backgroundColor="rgba(0, 0, 0, 0.25)"
                width="auto"
                px="24px"
                py="12px"
                borderRadius="75px"
                gap="20px"
            >
                {STATES.map((item) => (
                    <Button
                        key={item}
                        minW="100px"
                        variant={activeButton === item ? "primary" : "unstyled"}
                        color="white"
                        size="sm"
                        onClick={() => {
                            setActiveButton(item);
                            setColumnFilters(item === "all" ? [] : [{
                                id: "state",
                                value: item
                            }]);
                        }}
                        textTransform="capitalize"
                    >
                        {item}
                    </Button>
                ))}
            </HStack>

            <Divider opacity="0.2" />

            <PositionsTable
                columnFilters={columnFilters}
                positions={positions}
            />
        </Box>
    )
}

export default Positions