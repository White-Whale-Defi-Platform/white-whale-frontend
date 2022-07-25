import React from 'react'
import {
    useDisclosure,
    List,
    ListItem,
    ListIcon,
    Image,
    Popover, Text, PopoverContent, PopoverArrow, PopoverBody, Button, PopoverTrigger, VStack, HStack
} from '@chakra-ui/react'
import { BsCircleFill } from 'react-icons/bs'
import { ChevronDownIcon } from '@chakra-ui/icons'

const walletSelect = ({ denom, chainList = [], onChange }) => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)

    return (
        <Popover placement='top-end' 
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        >
            <PopoverTrigger>
                <HStack as={Button} variant="unstyled">
                    <Text>{denom}</Text>

                    <ChevronDownIcon />
                </HStack>
            </PopoverTrigger>
            <PopoverContent
                borderColor="#1C1C1C"
                borderRadius="30px"
                backgroundColor="#1C1C1C"
                width="253px"
                marginTop={3}
            >
                <PopoverArrow bg='#1C1C1C' boxShadow="unset" style={{ boxShadow: "unset" }} />
                <PopoverBody padding={6}  >
                    <VStack alignItems="flex-start" width="full" gap={2}>
                        <Text color="brand.200" fontSize="22px" fontWeight="400">Select network</Text>

                        <List spacing={1} color="white" width="full" >

                            {chainList.map((chain, index) => (
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
                                    onClick={() => { onChange(chain); onClose() }}
                                >
                                    <HStack>
                                        <Image src={chain?.icon} boxSize={50} maxH={10} />
                                        <Text paddingLeft={3} >{chain.label}</Text>
                                    </HStack>
                                    <ListIcon as={BsCircleFill} color='#3CCD64' boxShadow="0px 0px 14.0801px #298F46" bg="#1C1C1C" borderRadius="full" />
                                </ListItem>
                            ))}

                        </List>


                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}

export default walletSelect