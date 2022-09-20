import React from 'react'
import { HStack } from '@chakra-ui/react'

import DisplayBalance from 'components/Wallet/ChainSelectWithBalance/DisplayBalance'
import Select from 'components/Wallet/ChainSelect/Select'

function ChainSelectWithBalance({connected, denom, onChainChange}) {
  return (
    <HStack spacing="4"  >
      <DisplayBalance />
      <Select
        connected={connected}
        denom={denom?.coinDenom}
        onChange={onChainChange}/>
    </HStack>
  )
}

export default ChainSelectWithBalance