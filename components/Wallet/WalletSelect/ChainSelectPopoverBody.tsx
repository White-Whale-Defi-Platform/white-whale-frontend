import React from 'react'
import { PopoverBody, VStack, Text } from '@chakra-ui/react'
import ChainList from './ChainList/ChainList'
import NetworkForm from './NetworkForm/NetworkForm'

function ChainSelectPopoverBody({onChange, onClose, chainList, onDisconnect}) {
  return (
    <PopoverBody padding={6}  >
      <VStack alignItems="flex-start" width="full" gap={2}>
        <Text color="brand.50" fontSize="16px" fontWeight="400">Select network</Text>
        {!process?.env?.production && (
          <NetworkForm onDisconnect={onDisconnect}/>
        )}
        <ChainList onChange={onChange} onClose={onClose} chainList={chainList} />
      </VStack>
  </PopoverBody>
  )
}

export default ChainSelectPopoverBody
