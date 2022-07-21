import { ChevronDownIcon } from '@chakra-ui/icons'
import {
    HStack, IconButton, Image, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text
} from '@chakra-ui/react'
import { useRef, useState , useEffect} from 'react'



const Select = ({onChange, options=[], width = "full", defaultSelcted = null}) => {

    const popover = useRef(null)
    const [selected, setSelected] = useState(defaultSelcted || options?.[0])

    useEffect(() => {
        setSelected(defaultSelcted)
    },[defaultSelcted])

    return (

        <Popover offset={[0,0]}>
            {({ isOpen, onClose }) => (
                <>

                    <PopoverTrigger>
                        <HStack
                            tabIndex={0}
                            ref={popover}
                            role='button'
                            border="1px solid rgba(255, 255, 255, 0.1)"
                            borderTopEndRadius="30px"
                            borderTopStartRadius="30px"
                            // borderBottom="unset"
                            borderBottomEndRadius={isOpen ? "unset" : "30px"}
                            borderBottomStartRadius={isOpen ? "unset" : "30px"}
                            justifyContent="space-between"
                            width={width}
                            paddingX={3}
                            paddingY="3px"
                        >
                            <HStack>
                                {selected?.icon && (<Image src={selected?.icon} alt="logo-small" boxSize="2rem" />)}
                                <Text fontSize="20" fontWeight="400" paddingLeft={!selected?.icon && 5}>{selected?.label}</Text>
                            </HStack>
                            <IconButton
                                variant="unstyled"
                                color="white"
                                aria-label='go back'
                                icon={<ChevronDownIcon />}
                            />

                        </HStack>
                    </PopoverTrigger>
                    <PopoverContent
                        className='testing'
                        borderColor="rgba(255, 255, 255, 0.1)"
                        borderBottomEndRadius="30px"
                        borderBottomStartRadius="30px"
                        borderTop="unset"
                        borderTopStartRadius="unset"
                        borderTopEndRadius="unset"
                        backgroundColor="#1C1C1C"
                        width={popover?.current?.offsetWidth}
                        overflow="hidden"
                        >

                        <PopoverBody
                            paddingX="unset"
                            // backgroundColor="black"
                            backgroundColor="rgba(0,0,0,0.3)"
                            borderColor="rgba(255, 255, 255, 0.1)"
                        >
                            {
                                options
                                .filter(({label}) => selected?.label !== label)
                                .map((item, index) => (
                                    <HStack
                                        key={item?.value}
                                        role='option'
                                        // justify="space-between"
                                        paddingX={5}
                                        paddingY={item?.icon? 1 : 2}
                                        borderBottom={index === options.length - 2 ? 'unset' : "1px solid"}
                                        borderBottomColor="whiteAlpha.300"
                                        _hover={{
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            setSelected(item)
                                            onChange(item)
                                            onClose()
                                        }}
                                    >
                                        {item?.icon && (<Image src={item?.icon} alt="logo-small" boxSize="2rem" />)}
                                        
                                        <Text fontWeight="400">{item?.label}</Text>
                                    </HStack>
                                ))
                            }

                        </PopoverBody>
                    </PopoverContent>
                </>
            )}
        </Popover>

    )
}

export default Select