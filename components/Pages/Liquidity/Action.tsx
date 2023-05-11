import { Button, Box } from "@chakra-ui/react";
import { useClosePosition } from "./hooks/useClosePosition";
import { useWithdrawPosition } from "./hooks/useWithdrawPosition";

export const Action = ({ item, poolId }) => {
    const close = useClosePosition({ poolId });
    const withdraw = useWithdrawPosition({ poolId });

    if (item?.state === 'active')
        return (
            <Button
                width="full"
                variant="outline"
                size="sm"
                isLoading={close?.isLoading}
                onClick={() => close?.submit({unbonding_duration : item?.unbonding_duration})}
            >
                Close
            </Button>
        );
    else if (item?.state === 'unbonding')
        return (
            <Button
                width="full"
                variant="outline"
                size="sm"
                isDisabled={true}
            >
                Unbonding
            </Button>
        );
    else if (item?.state === 'unbound')
        return (
            <Button
                width="full"
                variant="outline"
                size="sm"
                isLoading={withdraw?.isLoading}
                onClick={() => withdraw?.submit()}
            >
                Unbound
            </Button>
        );

    else
        <Box w="full" />;
};
