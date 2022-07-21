import React from 'react'
import {
    List,
    ListItem,
    ListIcon,
    Image,
    Popover, Text, PopoverContent, PopoverArrow, PopoverBody, Button, PopoverTrigger, PopoverCloseButton, VStack, HStack
} from '@chakra-ui/react'
import { BsCircleFill } from 'react-icons/bs'

const walletSelect = ({ denom, chainList = [], onChange }) => {
    return (
        <Popover placement='top-end'>
            <PopoverTrigger>
                <Button variant="unstyled" color="white" textTransform="capitalize" >{denom}</Button>
            </PopoverTrigger>
            <PopoverContent
                borderColor="#1C1C1C"
                borderRadius="30px"
                backgroundColor="#1C1C1C"
                width="253px"

            // overflow="hidden"
            >
                <PopoverArrow bg='#1C1C1C' boxShadow="unset" style={{ boxShadow: "unset" }} />
                <PopoverBody padding={6}  >
                    <VStack alignItems="flex-start" width="full" gap={2}>
                        <Text color="brand.200" fontSize="22px" fontWeight="400">Select network</Text>

                        <List spacing={1} color="white" width="full" >

                            {chainList.map((chain,index) => (
                                <ListItem
                                    key={chain.chainId + chain?.chainName}
                                    justifyContent="space-between"
                                    display="flex"
                                    alignItems="center"
                                    borderBottom={index === chainList.length - 1 ? 'unset' : "1px solid rgba(255, 255, 255, 0.1)"}
                                    paddingY={1}
                                    opacity={chain.active ? 1 : 0.3}
                                    cursor="pointer"
                                    _hover={{
                                        opacity: 1
                                    }}
                                    onClick={() => onChange(chain)}
                                >
                                    <HStack>
                                        <Image src="/juno.svg" boxSize={50} />
                                        <Text paddingLeft={3} >{chain.chainName}</Text>
                                    </HStack>
                                    <ListIcon as={BsCircleFill} color='#3CCD64' boxShadow="0px 0px 14.0801px #298F46" bg="#1C1C1C" borderRadius="full" />
                                </ListItem>
                            ))}


                            {/* <ListItem
                                justifyContent="space-between"
                                display="flex"
                                alignItems="center"
                                borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                                paddingY={1}
                                // paddingRight={5}
                                opacity="0.3"
                                cursor="pointer"
                                _hover={{
                                    opacity: 1
                                }}
                            >
                                <HStack>
                                    <Image src="/juno.svg" boxSize={50} />
                                    <Text paddingLeft={3} >Juno</Text>
                                </HStack>
                                <ListIcon as={BsCircleFill} color='#3CCD64' boxShadow="0px 0px 14.0801px #298F46" bg="#1C1C1C" borderRadius="full" />
                            </ListItem>

                            <ListItem
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                cursor="pointer"
                                _hover={{
                                    opacity: 1
                                }}
                            >
                                <HStack>
                                    <Image src="/junoone.svg" boxSize={50} />
                                    <Text paddingLeft={3}>Terra</Text>
                                </HStack>
                                <ListIcon as={BsCircleFill} color='#3CCD64' boxShadow="0px 0px 14.0801px #298F46" bg="#1C1C1C" borderRadius="full" />
                            </ListItem> */}


                        </List>


                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}

export default walletSelect