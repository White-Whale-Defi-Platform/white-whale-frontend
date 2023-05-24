import { Box, Button, Divider, HStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React, { useState } from 'react'
import PositionsTable from './PositionsTable';

type Props = {}

const STATES = ["all", "active", "upcoming", "over"]

const Positions = (props: Props) => {

    const [activeButton, setActiveButton] = useState("all");
    const [columnFilters, setColumnFilters] = useState([]);

    const positions = [
        {
            id: 1,
            state: "active",
            startDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            endDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            value: "1000",
            action: <Button variant="outline" size="sm">Close</Button>
        },
        {
            id: 2,
            state: "upcoming",
            startDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            endDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            value: "2000",
            action: <Button variant="outline" size="sm">Close</Button>
        },
        {
            id: 3,
            state: "over",
            startDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            endDate: dayjs.unix(1684304073).format("YYYY/MM/DD") ,
            value: "3000",
            action: <Button variant="outline" size="sm">Close</Button>
        }
    ]
    
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