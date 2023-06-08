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
import { useEffect, useState } from 'react'
import useDebounceValue from 'hooks/useDebounceValue'

type Props = {
  bondingDays: number
  setBondingDays: (value: number) => void
  show: boolean
}

const BondingDaysSlider = ({ bondingDays, setBondingDays, show }: Props) => {
  const [value, setValue] = useState(0)
  const days = useDebounceValue(value, 500)

  useEffect(() => {
    setBondingDays(days)
  }, [days])

  if (!show) return null

  return (
    <VStack width="full" alignItems="flex-start" gap="2" pb="6">
      <TooltipWithChildren label="Unbonding Duration">
        <Text>
          Unbonding Duration refers to the period of time it takes for your
          staked funds to be released
        </Text>
      </TooltipWithChildren>

      <Box width="full">
        <Slider
          defaultValue={0}
          value={value}
          step={1}
          min={0}
          max={365}
          borderRadius={100}
          height={1.5}
          onChange={setValue}
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
            ~{value} days
          </Text>
        </Box>
        {/* <Text color="brand.50" fontSize="14">Block 14936784 </Text> */}
      </HStack>
    </VStack>
  )
}

export default BondingDaysSlider
