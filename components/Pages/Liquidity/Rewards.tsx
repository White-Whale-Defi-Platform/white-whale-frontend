import { VStack, Text, HStack, Divider } from "@chakra-ui/react";
import { TooltipWithChildren } from "components/TooltipWithChildren";
import { AvailableRewards } from "./AvailableRewards";

export const Rewards = ({ rewards = [], totalValue }) => (
    <VStack
        alignItems="flex-start"
        p="20px"
        border="1px solid rgba(255, 255, 255, 0.1)"
        filter="drop-shadow(0px 0px 50px rgba(0, 0, 0, 0.25))"
        borderRadius="15px"
        width="full"
    >

        <HStack width="full" justifyContent="space-between">
            <Text fontSize="14px" color="whiteAlpha.700">Available Rewards</Text>
            <TooltipWithChildren label={`$${totalValue}`}>
                <AvailableRewards data={rewards} />
            </TooltipWithChildren>
        </HStack>

        <Divider />

        <HStack width="full" justifyContent="space-between">
            <Text fontSize="14px" color="whiteAlpha.700">Estimated Daily Rewards</Text>
            <TooltipWithChildren label="$34343">
            <Text fontSize="16">not implemented yet</Text>
            </TooltipWithChildren>
        </HStack>

    </VStack>
);
