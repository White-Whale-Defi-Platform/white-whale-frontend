import React from 'react'
import { FormControl, FormLabel, Text } from '@chakra-ui/react'
import NetworkSwitch from './NetworkSwitch'

function NetworkForm({onDisconnect}) {
  return (
  <FormControl display='flex' alignItems='center' justifyContent="space-between">
    <FormLabel htmlFor='network' mb='0'>
        <Text color="brand.50" fontSize="16px" fontWeight="400">Testnet</Text>
    </FormLabel>
    <NetworkSwitch onDisconnect={onDisconnect} />
  </FormControl>
  )
}

export default NetworkForm
