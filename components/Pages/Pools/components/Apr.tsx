import React from 'react'

import { Spinner, Text } from '@chakra-ui/react'
import useTradingHistory from 'hooks/useTradingHistory'
import moment from 'moment'

type Props = {
  pairAddr?: string
  tvl: string | number
}

const Apr = ({ pairAddr, tvl }: Props) => {
  const dateTime = moment()
    .utc()
    .subtract(24, 'hours')
    .format('YYYY-MM-DDTHH:mm:ss')
  const { feeVolume, isLoading } = useTradingHistory({
    pair: pairAddr,
    dateTime,
  })

  if (!pairAddr) return null
  if (isLoading) return <Spinner color="white" size="xs" float="right" />

  const apr =
    Number(tvl) > 0 ? 100 * (Number(feeVolume) / Number(tvl || 0)) * 365 : 0
  return <Text align="right">{`${apr.toFixed(2)} %`}</Text>
}

export default Apr
