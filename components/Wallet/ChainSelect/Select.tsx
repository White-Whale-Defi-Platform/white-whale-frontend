import React from 'react'
import {Popover, useDisclosure} from '@chakra-ui/react'

import ChainSelectPopoverContent from './ChainSelectPopoverContent'
import ChainSelectTrigger from './ChainSelectTrigger'

const Select = ({ denom, onChange, connected}) => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)

    return (
        <Popover placement='top-end'
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose} 
        >
            <ChainSelectTrigger connected={connected} denom={denom} />
            <ChainSelectPopoverContent onChange={onChange} onClose={onClose} />
        </Popover>
    )
}

export default Select
