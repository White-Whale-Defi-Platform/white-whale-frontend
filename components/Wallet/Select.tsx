import {
Popover, 
useDisclosure,
} from '@chakra-ui/react'
import React from 'react'
import WalletSelectPopoverContent from './WalletSelect/WalletSelectPopoverContent'
import WalletSelectTrigger from './WalletSelect/Trigger/WalletSelectTrigger'

const Select = ({ denom, chainList = [], onChange, connected, onDisconnect }) => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)

    return (
        <Popover placement='top-end'
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose}
        >
            <WalletSelectTrigger connected={connected} denom={denom} />
            <WalletSelectPopoverContent onChange={onChange} onClose={onClose} chainList={chainList} onDisconnect={onDisconnect} />
        </Popover>
    )
}

export default Select
