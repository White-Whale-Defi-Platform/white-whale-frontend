import React, { useState } from 'react'

import { SettingsIcon } from '@chakra-ui/icons'
import {
  Button,
  HStack,
  IconButton,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useBoolean,
} from '@chakra-ui/react'
import { slippageAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import { kBorderRadius } from 'constants/visualComponentConstants'
import { useRecoilState } from 'recoil'

import { amountInputValidation } from '../../../../util/amountInputValidation'

const SwapSettings = () => {
  const [slippage, setSlippage] = useRecoilState(slippageAtom)
  const [slippageDisplay, setSlippageDisplay] = useState('')
  const [auto, setAuto] = useBoolean(slippage === 0)
  const [error, setError] = useState(false)

  const onAuto = () => {
    setAuto.toggle()
    if (!auto === true) {
      setSlippage(0)
    } else {
      setSlippage(1)
    }
  }

  const onSlippageChange = ({ target }) => {
    // Set the visual display and then after store the numerical value
    setSlippageDisplay(amountInputValidation(target?.value || ''))

    if (auto === true) {
      setAuto.off()
    }

    if (target?.value && Number(target?.value) < 100) {
      if (error) {
        setError(false)
      }
      setSlippage(target?.value)
    } else {
      if (target?.value) {
        setError(true)
      }
      setSlippage(0)
      setAuto.on()
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="18px"
          aria-label="go back"
          icon={<SettingsIcon />}
        />
      </PopoverTrigger>
      <PopoverContent
        borderRadius={kBorderRadius}
        borderColor="black"
        backgroundColor="black"
      >
        <PopoverArrow
          bg="black"
          sx={{ '--popper-arrow-shadow-color': 'black' }}
        />
        <PopoverBody paddingX={8} paddingY={10}>
          <VStack width="full" alignItems="flex-start">
            <Text fontSize="14" fontWeight="700">
              Transaction Settings
            </Text>
            <Text fontSize="14" fontWeight="400" color="brand.50">
              Slippage Tolerance
            </Text>
            <HStack>
              <Button
                onClick={onAuto}
                paddingX={8}
                variant={auto ? 'primary' : 'outline'}
                size="sm"
              >
                Auto
              </Button>
              <InputGroup
                color="brand.500"
                borderRadius="100px"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderColor={slippage === 0 ? 'white' : 'brand.500'}
              >
                <NumberInput
                  variant="unstylized"
                  padding={0}
                  size="sm"
                  isValidCharacter={(char) => Boolean(char.match(/[.0-9]/u))}
                  value={slippageDisplay}
                >
                  <NumberInputField
                    paddingRight="2rem"
                    borderRadius={kBorderRadius}
                    placeholder="Custom"
                    color="brand.500"
                    backgroundColor="transparent"
                    // BorderColor="rgba(255, 255, 255, 0.1)"
                    textAlign="right"
                    value={slippage === 0 ? '' : slippage}
                    onChange={onSlippageChange}
                  />
                </NumberInput>
                <InputRightElement
                  color={slippage === 0 ? '#718096' : 'brand.500'}
                  paddingBottom="7px"
                  pointerEvents="none"
                >
                    %
                </InputRightElement>
              </InputGroup>
            </HStack>
            <HStack width="full" justifyContent="end">
              {error && (
                <Text fontSize="12px" color="red">
                  Slippage must be under 100
                </Text>
              )}
            </HStack>
            {/* <HStack paddingTop={2} width="full">
                            <Button width="full" onClick={() => setSlippage(0.1)} variant="solid" size="xs">
                                0.1%
                            </Button>
                            <Button width="full" onClick={() => setSlippage(0.5)} variant="solid" size="xs">
                                0.5%
                            </Button>
                            <Button width="full" onClick={() => setSlippage(1)} variant="solid" size="xs">
                                1%
                            </Button>
                        </HStack> */}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default SwapSettings
