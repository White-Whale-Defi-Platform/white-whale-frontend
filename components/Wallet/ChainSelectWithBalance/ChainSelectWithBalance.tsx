import React from 'react'

import { HStack } from '@chakra-ui/react'
import Select from 'components/Wallet/ChainSelect/Select'
import DisplayBalance from 'components/Wallet/ChainSelectWithBalance/DisplayBalance'

function ChainSelectWithBalance({
  connected,
  denom,
  onChainChange,
  currentWalletState,
}) {
  return (
    <HStack spacing="4">
      <DisplayBalance />
      <Select
        connected={connected}
        denom={denom?.coinDenom}
        onChange={onChainChange}
        currentWalletState={currentWalletState}
      />
    </HStack>
  )
}

export default ChainSelectWithBalance
