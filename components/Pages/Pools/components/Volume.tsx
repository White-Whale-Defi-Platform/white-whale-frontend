import React from 'react'

import { Spinner, Text } from '@chakra-ui/react'
import useVolume from 'hooks/useVolume'

import { formatPrice } from '../../../../libs/num'

type Props = {
  pair: string
  dateTime: string
}

const Volume = ({ pair, dateTime }: Props) => {
  const { volume, isLoading } = useVolume({ pair, dateTime })

  if (!pair || !dateTime) return null
  if (isLoading) return <Spinner color="white" size="xs" float="right" />
  return <Text align="right">{`$${formatPrice(volume)}`}</Text>
}

export default Volume
