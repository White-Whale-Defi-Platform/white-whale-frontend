import { HStack, Divider, Button, Box } from "@chakra-ui/react";
import { useState } from "react";
import { Position } from "./hooks/usePositions";
import { PositionsTable } from "./PositionsTable";

const STATES = ["all", "active", "unbounding"]

type Props = Position & {
    positions: any[]
}

export const Positions = ({ positions }: Props) => {

    const [activeButton, setActiveButton] = useState("all");
    const [columnFilters, setColumnFilters] = useState([]);

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
                        minW="120px"
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
    );
};
