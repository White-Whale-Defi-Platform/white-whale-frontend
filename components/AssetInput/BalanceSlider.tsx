import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from '@chakra-ui/react'

type Props = {
  balance: number
  amount: number
  onChange: (value: number) => void
  show?: boolean
}

const BalanceSlider = ({ balance, amount, onChange, show = true }: Props) => {
  if (!show) return null

  return (
    <Box width="full" px={5}>
      <Slider
        defaultValue={0}
        value={amount}
        step={0.0001}
        min={0}
        max={balance}
        borderRadius={100}
        height={1.5}
        onChange={onChange}
      >
        <SliderTrack height={1.5} bg="rgba(0, 0, 0, 0.5)">
          <SliderFilledTrack bg="brand.500" />
        </SliderTrack>
        <SliderThumb boxSize={6} bg="brand.500" />
      </Slider>
    </Box>
  )
}

export default BalanceSlider
