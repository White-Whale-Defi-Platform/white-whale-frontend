import React, { FC, useMemo } from 'react'

import { Box } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export const backgrounds = {
  'pisco-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(0, 117, 255, 0.25) 97.47%)',
  'uni-6':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 77, 0, 0.25) 97.47%)',
  'phoenix-1':
    'linear-gradient(135deg, rgba(15, 75, 85, 1) 0%, rgba(10, 135, 145, 1) 50%, rgba(60, 185, 195, 1) 100%)',
  'juno-1':
    'linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(204, 102, 0, 1) 50%, rgba(255, 0, 0, 1) 100%)',
  'chihuahua-1':
    'linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(230, 210, 0, 1) 50%, rgba(255, 165, 0, 1) 100%)',
  'injective-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(82, 206, 252, 0.50) 97.47%)',
  'injective-888':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(82, 206, 252, 0.50) 97.47%)',
  'comdex-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 64, 74, 0.50) 97.47%)',
  'pacific-1':
    'linear-gradient(90deg, rgba(0, 0, 0, 1) 0%,rgba(230, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 100%)',
  'comdex-test2':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(250, 64, 74, 0.50) 97.47%)',
  'narwhal-1':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(43, 68, 46, 0.50) 97.47%)',
  'migaloo-1':
    'linear-gradient(135deg, rgba(15, 75, 45, 1) 0%, rgba(10, 105, 55, 1) 50%, rgba(60, 175, 80, 1) 100%)',
  'columbus-5':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 255, 0, 0.25) 50%, rgba(0, 117, 255, 0.25) 97.47%)',
  'rebel-2':
    'linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 255, 0, 0.25) 50%, rgba(0, 117, 255, 0.25) 97.47%)',
  'osmosis-1':
    'linear-gradient(135deg, rgba(20, 15, 52, 0.75) 0%, rgba(20, 15, 52, 0.75) 50%, rgba(20, 15, 52, 0.75) 100%)',
}

const RadialGradient: FC = () => {
  const { chainId } = useRecoilValue(chainState)
  const background = useMemo(() => backgrounds[chainId], [chainId])
  return (
    <Box
      position="absolute"
      height="718px"
      left="-131px"
      top="-314px"
      background={background}
      width="full"
      filter="blur(250px)"
      borderTopRightRadius="20%"
      zIndex="-1"
    />
  )
}

export default RadialGradient
