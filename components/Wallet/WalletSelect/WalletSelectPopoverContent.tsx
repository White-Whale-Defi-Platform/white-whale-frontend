import React from 'react'
import { PopoverContent, PopoverArrow } from '@chakra-ui/react'
import ChainSelectPopoverBody from './ChainSelectPopoverBody'
function WalletSelectPopoverContent({onChange, onClose, chainList, onDisconnect}) {
  return (
  <PopoverContent
    borderColor="#1C1C1C"
    borderRadius="30px"
    backgroundColor="#1C1C1C"
    width="253px"
    marginTop={3}
  >
    <PopoverArrow bg='#1C1C1C' boxShadow="unset" style={{ boxShadow: "unset" }} sx={{ '--popper-arrow-shadow-color': 'black' }} />
    <ChainSelectPopoverBody onChange={onChange} onClose={onClose} chainList={chainList} onDisconnect={onDisconnect} />
  </PopoverContent>
  )
}

export default WalletSelectPopoverContent