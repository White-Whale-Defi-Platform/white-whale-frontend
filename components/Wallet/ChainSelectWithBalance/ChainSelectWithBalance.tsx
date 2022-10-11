import React from 'react'
import { HStack } from '@chakra-ui/react'

import DisplayBalance from 'components/Wallet/ChainSelectWithBalance/DisplayBalance'
import Select from 'components/Wallet/ChainSelect/Select'

function ChainSelectWithBalance({connected, denom, onChainChange, currentWalletState}) {
  return (
    <HStack spacing="4"  >
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