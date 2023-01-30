import { Box, Button, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text, useDisclosure, VStack } from '@chakra-ui/react'
import React from 'react'
import NavbarLink from './NavbarLink'





const NavbarPopper = ({ link, currentChainName }) => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)
    const numberOfLinks = link.childs.length

    return (
        <Popover
            placement="bottom"
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose}
        >
            <PopoverTrigger>
                <HStack as={Button} variant="unstyled">
                    <Text fontSize={['14px', '16px']} >{link.label}</Text>
                </HStack>
            </PopoverTrigger>
            <PopoverContent
                borderColor="#1C1C1C"
                borderRadius="25px"
                backgroundColor="#1C1C1C"
                width="auto"
                overflow="hidden"
            >
                <PopoverArrow
                    bg='#1C1C1C'
                    boxShadow="unset"
                    style={{ boxShadow: 'unset' }}
                    sx={{ '--popper-arrow-shadow-color': '#1C1C1C' }}
                />
                <PopoverBody px='unset' >
                    <VStack  >
                        {link.childs.map(({ lable, link }, index) => (

                            <Box
                                px={10}
                                pb={2}
                                width="full"
                                borderBottom={index === numberOfLinks - 1 ? 'unset' : "1px solid rgba(0, 0, 0, 0.5)" }
                            >
                                <NavbarLink
                                    key={lable}
                                    text={lable}
                                    href={`/${currentChainName}${link}`}
                                />
                                {/* <Text
                                    cursor="pointer"
                                    opacity={0.5}
                                    _hover={{
                                        opacity: 1,
                                    }}
                                    fontSize="16px" fontWeight="400">
                                    {lable}
                                </Text> */}
                            </Box>

                        ))}
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}

export default NavbarPopper
