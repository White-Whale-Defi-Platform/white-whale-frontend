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
                onClick={() => close?.submit()}
            >
                Close
            </Button>
        );
    else if (item?.state === 'unbounding')
        return (
            <Button
                width="full"
                variant="outline"
                size="sm"
                isDisabled={true}
            >
                Unbounding
            </Button>
        );
    else if (item?.state === 'unbound')
        return (
            <Button
                width="full"
                variant="outline"
                size="sm"
                onClick={() => withdraw?.submit()}
            >
                Unbound
            </Button>
        );

    else
        <Box w="full" />;
};
