import React from 'react'

import { HStack } from '@chakra-ui/react'
import SelectChainModal from 'components/Wallet/ChainSelect/SelectChainModal'
import DisplayBalance from 'components/Wallet/ChainSelectWithBalance/DisplayBalance'

function ChainSelectWithBalance({
  connected,
  denom,
  onChainChange,
  currentChainState,
}) {
  return (
    <HStack spacing="4">
      <DisplayBalance />
      <SelectChainModal
        connected={connected}
        denom={denom?.coinDenom}
        onChange={onChainChange}
        currentChainState={currentChainState}
      />
    </HStack>
  )
}

export default ChainSelectWithBalance
