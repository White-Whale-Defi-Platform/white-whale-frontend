import React from 'react'

import { Spinner, Text } from '@chakra-ui/react'
import useTradingHistory from 'hooks/useTradingHistory'
import moment from 'moment'

import { formatPrice } from '../../../../libs/num'

type Props = {
  pairAddr?: string
}

const Volume = ({ pairAddr }: Props) => {
  const dateTime = moment()
    .utc()
    .subtract(24, 'hours')
    .format('YYYY-MM-DDTHH:mm:ss')
  const { tradingVolume, isLoading } = useTradingHistory({
    pair: pairAddr,
    dateTime,
  })

  if (!pairAddr) {
    return null
  }
  if (isLoading) {
    return <Spinner color="white" size="xs" float="right" />
  }

  return <Text align="right">{`$${formatPrice(tradingVolume)}`}</Text>
}

export default Volume
