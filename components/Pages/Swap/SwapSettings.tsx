import React, { useState } from 'react'
import { useBoolean, Text, Popover, PopoverTrigger, IconButton, PopoverContent, PopoverArrow, PopoverBody, Button, VStack, HStack, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { slippageAtom } from './swapAtoms'
import { useRecoilState } from 'recoil'

const SwapSettings = () => {

    const [slippage, setSlippage] = useRecoilState(slippageAtom)
    const [auto, setAuto] = useBoolean(slippage === 0)
    const [error, setError] = useState(false)

    const onAuto = () => {
        setAuto.toggle()
        if (!auto === true) {
            setSlippage(0)
        } else {
            setSlippage(0.01)
        }
    }

    const onSlippageChange = ({ target }) => {
        if (auto === true) setAuto.off()

        if ((!!target?.value) && Number(target?.value) < 100) {
            if (error) setError(false)
            setSlippage(target?.value)
        }
        else {
            if (!!target?.value) setError(true)
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
                    aria-label='go back'
                    icon={<SettingsIcon />}
                />
            </PopoverTrigger>
            <PopoverContent
                borderRadius="30px"
                borderColor="black"
                backgroundColor="black"

            >
                <PopoverArrow
                    bg='black'
                    sx={{ '--popper-arrow-shadow-color': 'black'}}
                />
                <PopoverBody
                    paddingX={8}
                    paddingY={10}
                >
                    <VStack width="full" alignItems="flex-start">
                        <Text fontSize="14" fontWeight="700">Transaction Settings</Text>
                        <Text fontSize="14" fontWeight="400" color="brand.50">Slippage Tolerance</Text>
                        <HStack>
                            <Button onClick={onAuto} paddingX={8} variant={auto ? "primary" : "outline"} size="sm">
                                Auto
                            </Button>
                            <InputGroup
                                color="brand.500"
                                borderRadius="100px"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderColor={slippage === 0 ? "white" : "brand.500"}
                                paddingY={1}
                            >
                                <Input
                                    type="number"
                                    variant="unstyled"
                                    borderRadius="30px"
                                    placeholder='Custom'
                                    color="brand.500"
                                    // borderColor="rgba(255, 255, 255, 0.1)"
                                    size="sm"
                                    textAlign="right"
                                    value={slippage === 0 ? '' : slippage}
                                    onChange={onSlippageChange}

                                />
                                <InputRightElement
                                    color={slippage === 0 ? "#718096" : "brand.500"}
                                    paddingBottom="10px"
                                    pointerEvents='none'
                                    children="%"

                                />
                            </InputGroup>
                        </HStack>
                        <HStack width="full" justifyContent="end">
                            {error && (<Text fontSize="12px" color="red">Slippage must be under 100</Text>)}
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