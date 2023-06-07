import { Button, HStack } from '@chakra-ui/react'
import useForeceEpoch from './hooks/useForeceEpoch'

const ForceEpoch = () => {

    const forceEpoch = useForeceEpoch()

    return (
        <HStack justifyContent="flex-end">
            <Button
                variant="primary"
                size="sm"
                onClick={() => forceEpoch.submit()}
                isLoading={forceEpoch.isLoading}
            >
                Force Epoch
            </Button>
        </HStack>
    )
}

export default ForceEpoch