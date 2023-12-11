import React from 'react'

import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Text,
  VStack,
} from '@chakra-ui/react'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'

import ChainList from './ChainList/ChainList'
import NetworkForm from './NetworkForm/NetworkForm'

const ChainSelectPopoverContent = ({ onChange, onClose, currentChainState, connectedChainIds }) => (
  <PopoverContent
    borderColor={kBg}
    borderRadius={kBorderRadius}
    backgroundColor={'#141414'}
    width="253px"
    marginTop={3}
  >
    <PopoverArrow
      bg={kBg}
      boxShadow="unset"
      style={{ boxShadow: 'unset' }}
      sx={{ '--popper-arrow-shadow-color': '#1C1C1C' }}
    />
    <PopoverBody padding={6}>
      <VStack alignItems="flex-start" width="full" gap={2}>
        <Text color="brand.50" fontSize="16px" fontWeight="400">
            Select network
        </Text>
        {!process?.env?.production && <NetworkForm />}
        <ChainList
          onChange={onChange}
          onClose={onClose}
          currentChainState={currentChainState}
          connectedChainIds={connectedChainIds}
        />
      </VStack>
    </PopoverBody>
  </PopoverContent>
)

export default ChainSelectPopoverContent
