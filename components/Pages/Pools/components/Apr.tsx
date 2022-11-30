import React from 'react'

import { Spinner, Text } from '@chakra-ui/react'
import useFeeVolume from 'hooks/useFeeVolume'

type Props = {
  pair: string
  dateTime: string
  tvl: string | number
}

const Apr = ({ pair, tvl, dateTime }: Props) => {
  const { volume, isLoading } = useFeeVolume({ pair, dateTime })

  if (!pair || !dateTime) return null
  if (isLoading) return <Spinner color="white" size="xs" float="right" />

  const apr =
    Number(tvl) > 0 ? 100 * (Number(volume) / Number(tvl || 0)) * 365 : 0
  return <Text align="right">{`${apr.toFixed(2)} %`}</Text>
}

export default Apr
