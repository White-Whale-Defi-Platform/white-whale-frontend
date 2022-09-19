import React from 'react'
import { FormControl, FormLabel, Text } from '@chakra-ui/react'

import NetworkSwitch from 'components/Wallet/ChainSelect/NetworkForm/NetworkSwitch'

function NetworkForm() {
  return (
  <FormControl display='flex' alignItems='center' justifyContent="space-between">
    <FormLabel htmlFor='network' mb='0'>
        <Text color="brand.50" fontSize="16px" fontWeight="400">Testnet</Text>
    </FormLabel>
    <NetworkSwitch />
  </FormControl>
  )
}

export default NetworkForm
