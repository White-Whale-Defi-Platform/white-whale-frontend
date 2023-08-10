import React from 'react'

import {
  Box,
  Divider,
  HStack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'

type Props = {
  liquidity: string
  infos: any
}

const Liquidity = ({ liquidity, infos }: Props) => {
  const assets = infos.poolAssets
  return (
    <Tooltip
      sx={{ boxShadow: 'none' }}
      label={
        <VStack
          minW="250px"
          minH="fit-content"
          borderRadius="10px"
          bg="blackAlpha.900"
          px="4"
          py="4"
          position="relative"
          border="none"
          justifyContent="center"
          alignItems="center"
        >
          <>
            {<> </>}
            {assets.map((name, index) => {
              return (
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
                        Math.pow(10, infos.poolAssets[index].decimals)
                      ).toFixed(2)}
                    </Text>
                  </HStack>
                  {index !== assets.length - 1 && (
                    <Divider
                      width="93%"
                      borderWidth="0.1px"
                      color="whiteAlpha.300"
                    />
                  )}
                </React.Fragment>
              )
            })}
          </>
        </VStack>
      } //displaying nothing when wallet disconnected
      bg="transparent"
    >
      <VStack alignItems="flex-start" minW={100}>
        <Text mb="-0.3rem" color="white">
          {
            <HStack borderBottom="1px dotted rgba(255, 255, 255, 0.5)" h="30px">
              <Text align="right">{liquidity}</Text>
            </HStack>
          }
        </Text>
        <Box pb={1}>
          {
            <div
              style={{
                width: `0px`,
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

export default Liquidity
