import React from 'react'
import { PopoverContent, PopoverArrow, PopoverBody, VStack, Text } from '@chakra-ui/react'

import ChainList from './ChainList/ChainList'
import NetworkForm from './NetworkForm/NetworkForm'

function ChainSelectPopoverContent({onChange, onClose}) {
  return (
  <PopoverContent
    borderColor="#1C1C1C"
    borderRadius="30px"
    backgroundColor="#1C1C1C"
    width="253px"
    marginTop={3}
  >
    <PopoverArrow bg='#1C1C1C' boxShadow="unset" style={{ boxShadow: "unset" }} sx={{ '--popper-arrow-shadow-color': 'black' }} />
    <PopoverBody padding={6}  >
      <VStack alignItems="flex-start" width="full" gap={2}>
        <Text color="brand.50" fontSize="16px" fontWeight="400">Select network</Text>
        {!process?.env?.production && (
          <NetworkForm />
        )}
        <ChainList onChange={onChange} onClose={onClose} />
      </VStack>
  </PopoverBody>
  </PopoverContent>
  )
}

export default ChainSelectPopoverContent