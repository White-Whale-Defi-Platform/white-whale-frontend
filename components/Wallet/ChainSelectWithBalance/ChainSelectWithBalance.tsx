import React from 'react'

import { HStack } from '@chakra-ui/react'
import SelectChainModal from 'components/Wallet/ChainSelect/SelectChainModal'
import { DisplayBalance } from 'components/Wallet/ChainSelectWithBalance/DisplayBalance'

export const ChainSelectWithBalance = ({
  connected,
  denom,
  onChainChange,
  currentChainState,
  currentConnectedChainIds,
}) => (
  <HStack spacing="4">
    <DisplayBalance />
    <SelectChainModal
      connected={connected}
      denom={denom?.coinDenom}
      onChange={onChainChange}
      currentChainState={currentChainState}
      connectedChainIds={currentConnectedChainIds}
    />
  </HStack>
)

export default ChainSelectWithBalance
