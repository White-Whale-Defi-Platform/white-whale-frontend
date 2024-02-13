import React, { useState } from 'react'

import { Box, Divider, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'

type Props = {
  liquidity: string
  infos: any
}

export const Liquidity = ({ liquidity, infos }: Props) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const { poolAssets } = infos
  const { price } = infos
  const tooltipDisabled = liquidity === 'n/a'
  return (

    <Tooltip
      isDisabled={tooltipDisabled}
      isOpen={!tooltipDisabled && isLabelOpen}
      sx={{ boxShadow: 'none' }}
      label={
        <VStack
          minW="250px"
          minH="fit-content"
          borderRadius="10px"
          bg="blackAlpha.900"
          boxShadow={'0px 0px 3px 3px rgba(255, 255, 255, 0.25)'}
          px="4"
          py="4"
          position="relative"
          border="none"
          justifyContent="center"
          alignItems="center">
          <>
            {poolAssets.map((name, index) => (
              <React.Fragment key={name.name}>
                <HStack
                  justify="space-between"
                  direction="row"
                  width="full"
                  px={2}
                >
                  <Text color="whiteAlpha.600" fontSize={14}>
                    {name.name}
                  </Text>
                  <Text fontSize={14}>
                    {(
                      infos.liquidity.reserves.total[index] /
                        (10 ** infos.poolAssets[index].decimals)
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 8,
                    })}
                  </Text>
                </HStack>
                {index !== poolAssets.length - 1 && (
                  <Divider
                    width="93%"
                    borderWidth="0.1px"
                    color="whiteAlpha.300"
                  />
                )}
              </React.Fragment>
            ))}
            <Divider
              width="93%"
              borderWidth="0.1px"
              color="whiteAlpha.300"
            />
            <HStack
              justify="space-between"
              direction="row"
              width="full"
              px={2}
            >
              <Text color="whiteAlpha.600" fontSize={14}>
                {'Ratio'}
              </Text>
              <Text fontSize={14}>
                {price.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })}
              </Text>
            </HStack>
          </>
        </VStack>
      } // Displaying nothing when wallet disconnected
      bg="transparent"
    >
      <VStack alignItems="flex-start" minW={100}>
        <Text mb="-0.3rem" color="white">
          {
            <HStack borderBottom={!tooltipDisabled ? '1px dotted rgba(255, 255, 255, 0.5)' : 'InactiveBorder'} paddingTop={'2'}>
              <Text align="right" onMouseEnter={() => setIsLabelOpen(true)}
                onMouseLeave={() => setIsLabelOpen(false)}
                onClick={() => setIsLabelOpen(!isLabelOpen)}>{liquidity}</Text>
            </HStack>
          }
        </Text>
        <Box pb={1}>
          {
            <div
              style={{
                width: '0px',
                height: '1px',
                background: `repeating-linear-gradient(
            to right,
            white,
            white 1px,
            transparent 1px,
            transparent 5px
          )`,
              }}
            />
          }
        </Box>
      </VStack>
    </Tooltip>
  )
}

