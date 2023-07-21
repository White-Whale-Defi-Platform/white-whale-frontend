import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type Props = {
  bondingDays: number
  setBondingDays: (value: number) => void
  show: boolean
}

export const BondingDaysSlider = ({
  bondingDays,
  setBondingDays,
  show,
}: Props) => {
  if (!show) {
    return null
  }

  return (
    <VStack width="full" alignItems="flex-start" gap="2" pb="6">
      <TooltipWithChildren label="Unlock Duration">
        <Text>
          {'Unlock duration refers to the period of time it takes for your locked funds to be released.\n' +
            'IMPORTANT: Tokens are locked until the position is closed and the unbonding period is over, ' +
            'which only starts after this position has been closed.'}
        </Text>
      </TooltipWithChildren>

      <Box width="full">
        <Slider
          defaultValue={0}
          value={bondingDays}
          step={1}
          min={0}
          max={365}
          borderRadius={100}
          height={1.5}
          onChange={setBondingDays}
        >
          <SliderTrack height={1.5} bg="rgba(0, 0, 0, 0.5)">
            <SliderFilledTrack bg="brand.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} bg="brand.500" />
        </Slider>
      </Box>

      <HStack gap="4">
        <Box px="10" py="2" bg="rgba(0, 0, 0, 0.5)" borderRadius="100px">
          <Text color="white" fontSize="14">
            {' '}
            ~{bondingDays} days
          </Text>
        </Box>
      </HStack>
    </VStack>
  )
}
