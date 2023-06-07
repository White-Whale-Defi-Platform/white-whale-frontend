import { Button, HStack } from '@chakra-ui/react'
import useForeceEpoch from './hooks/useForeceEpoch'

type Props = {
    poolId: string;
}

const ForceEpoch = ({poolId}: Props) => {

    const forceEpoch = useForeceEpoch(poolId)



    return (
        <HStack w="full" justifyContent="flex-end">
            <Button
                variant="primary"
                size="sm"
                onClick={() => forceEpoch.submit()}
                isLoading={forceEpoch.isLoading}
                isDisabled={!forceEpoch.isSupported}
            >
                Force Epoch
            </Button>
        </HStack>
    )
}

export default ForceEpoch