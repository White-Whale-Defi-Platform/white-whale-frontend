import {
  Box,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
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

const setBondingdays = (
  input: string, setBondingDays: any, bondingDays:number,
) => {
  if (Number(input).valueOf() === 0 && Number(bondingDays).valueOf() === 0) {
    setBondingDays(Number(bondingDays).valueOf())
  }
  if (Number(input) <= 365 && Number(input) >= 0) {
    setBondingDays(input)
  }
  if (Number(input) > 365) {
    setBondingDays(365)
  }
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
          focusThumbOnChange={false}
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
      <HStack>
        <Box
          px={2}
          py="2"
          bg="rgba(0, 0, 0, 0.5)"
          borderRadius="100px"
          maxWidth={''}
        >
          <NumberInput
            defaultValue={0}
            min={0}
            max={365}
            textColor={'white'}
            size={'xs'}
            value={bondingDays.valueOf()}
            inputMode={'numeric'}
            onChange={(elem: string) => {
              setBondingdays(
                elem, setBondingDays, bondingDays,
              )
            }}
          >
            <NumberInputField border={'hidden'} maxWidth={'70'} />
            <NumberInputStepper minWidth={'8'} py={'3px'}>
              <Text fontSize={'12'}>Days</Text>
            </NumberInputStepper>
          </NumberInput>
        </Box>
      </HStack>
    </VStack>
  )
}
