import React, { FC, useMemo } from 'react'

import { Box } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

const backgrounds = {
  'pisco-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(0, 117, 255, 0.25) 97.47%)',
  'uni-6':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 77, 0, 0.25) 97.47%)',
  'phoenix-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(0, 117, 255, 0.25) 97.47%)',
  'juno-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 77, 0, 0.25) 97.47%)',
  'chihuahua-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 212, 52, 0.50) 97.47%)',
  'injective-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(82, 206, 252, 0.50) 97.47%)',
  'injective-888':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(82, 206, 252, 0.50) 97.47%)',
  'comdex-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 64, 74, 0.50) 97.47%)',
  'pacific-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 64, 74, 0.50) 97.47%)',
  'comdex-test2':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 64, 74, 0.50) 97.47%)',
  'narwhal-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(43, 68, 46, 0.50) 97.47%)',
  'migaloo-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(43, 68, 46, 0.50) 97.47%)',
}

const RadialGradient: FC = () => {
  const { chainId } = useRecoilValue(walletState)
  const wallet = useMemo(() => backgrounds[chainId], [chainId])

  return (
    <Box
      position="absolute"
      height="718px"
      left="-131px"
      top="-314px"
      background={wallet}
      width="full"
      filter="blur(250px)"
      borderTopRightRadius="20%"
      zIndex="-1"
    />
  )
}

export default RadialGradient
