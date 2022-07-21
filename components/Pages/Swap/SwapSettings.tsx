import React from 'react'
import { Text, Popover, PopoverTrigger, IconButton, PopoverContent, PopoverArrow, PopoverBody, Button, VStack, HStack, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { slippageAtom } from './swapAtoms'
import { useRecoilState } from 'recoil'

const SwapSettings = () => {

    const [slippage, setSlippage] = useRecoilState(slippageAtom)

    return (
        <Popover>
            <PopoverTrigger>
                <IconButton
                    variant="unstyled"
                    color="#7A7A7A"
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
                />
                <PopoverBody
                    paddingX={8}
                    paddingY={10}
                >
                    <VStack width="full" alignItems="flex-start">
                        <Text fontSize="14" fontWeight="700">Transaction Settings</Text>
                        <Text fontSize="14" fontWeight="400" color="brand.200">Slippage Tolerance?</Text>
                        <HStack>
                            <Button paddingX={8} variant="primary" size="sm">Auto</Button>
                            <InputGroup
                                color="brand.200"

                            >

                                <Input
                                    type="number"
                                    // variant='unstyled'
                                    borderRadius="30px"
                                    borderColor="rgba(255, 255, 255, 0.1)"
                                    size="sm"
                                    textAlign="right"
                                    value={slippage}
                                    onChange={({target}:any) => setSlippage(target?.value)}
                                />
                                <InputRightElement
                                    paddingBottom="5px"
                                    pointerEvents='none'
                                    children="%"
                                    
                                />
                            </InputGroup>
                        </HStack>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}

export default SwapSettings