import React from 'react'
import { Text, Spinner } from '@chakra-ui/react'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'

function DisplayBalance() {
    const baseToken = useBaseTokenInfo()
    const { balance, isLoading } = useTokenBalance(baseToken?.symbol)

  return (
    <>
    {isLoading ? (
      <Spinner color='white' size='xs' />
      ) : (
      <Text fontSize="16px" display={['none', 'flex']}>{balance?.toFixed(1)}</Text>
    )}
    </>

  )
}

export default DisplayBalance