import React from 'react'

import { Spinner, Text } from '@chakra-ui/react'
import useFeeVolume from 'hooks/useFeeVolume'
import moment from 'moment'

type Props = {
  pairAddr?: string
  tvl: string | number
}

const Apr = ({ pairAddr, tvl }: Props) => {
  const dateTime = moment
    .utc()
    .subtract(0, 'days')
    .startOf('day')
    .format('YYYY-MM-DDTHH:mm:ss')
  const { volume, isLoading } = useFeeVolume({ pair: pairAddr, dateTime })

  if (!pairAddr) return null
  if (isLoading) return <Spinner color="white" size="xs" float="right" />

  const apr =
    Number(tvl) > 0 ? 100 * (Number(volume) / Number(tvl || 0)) * 365 : 0
  return <Text align="right">{`${apr.toFixed(2)} %`}</Text>
}

export default Apr
