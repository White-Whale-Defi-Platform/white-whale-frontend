import {
    Box,
    Button,
    HStack,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Spacer,
    Spinner,
    Text, VStack
  } from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type Props = {
    multiplicator: string;
}

const Multiplicator = ({multiplicator}: Props) => {
    return (
        <HStack
            justifyContent="space-between"
            width="full"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="15px"
            p={4}
            pt={3.5}
            style={{ marginBottom: 50 }}
        >
            <TooltipWithChildren
                label="Multiplicator"
                isHeading
                fontSize="16"
            >
                <Text fontSize="16">Multiplicator</Text>
            </TooltipWithChildren>

            <TooltipWithChildren
                label={multiplicator}
                fontSize="16"
            >
                <Text fontSize="16">3,111</Text>
            </TooltipWithChildren>
        </HStack>
    )
}

export default Multiplicator