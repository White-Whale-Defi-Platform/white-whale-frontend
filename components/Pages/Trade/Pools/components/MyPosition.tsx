import React, { useMemo, useState } from 'react'

import { Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { calculateMyPosition } from 'components/Pages/Trade/Pools/util'
import { useTokenList } from 'hooks/useTokenList'
import { getDecimals } from 'util/conversion/index'

type Props = {
  myPoolPosition: any
}

export const MyPosition = ({ myPoolPosition } : Props) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const { liquidity, pool_id } = myPoolPosition
  const tooltipDisabled = myPoolPosition === 'n/a'
  const [tokenSymbolA, tokenSymbolB] = pool_id?.split('-') || []
  const [tokenList] = useTokenList()
  const { tokenABalance, tokenBBalance } = useMemo(() => {
    const [reserveA, reserveB] = liquidity?.reserves?.myNotLocked || []
    const tokenADecimal = getDecimals(tokenSymbolA, tokenList)
    const tokenBDecimal = getDecimals(tokenSymbolB, tokenList)

    return {
      tokenABalance: reserveA * (10 ** -tokenADecimal),
      tokenBBalance: reserveB * (10 ** -tokenBDecimal),
    }
  }, [liquidity, tokenList?.tokens])

  const data = [{
    balance: tokenABalance,
    symbol: tokenSymbolA,
  }, {
    balance: tokenBBalance,
    symbol: tokenSymbolB,
  }]

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
            {data.map(({ balance, symbol }) => (
              <React.Fragment key={symbol}>
                <HStack
                  justify="space-between"
                  direction="row"
                  width="full"
                  px={2}
                >
                  <Text color="whiteAlpha.600" fontSize={14}>
                    {symbol}
                  </Text>
                  <Text fontSize={14}>
                    {(balance
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6,
                    })}
                  </Text>
                </HStack>
              </React.Fragment>
            ))}
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
                onClick={() => setIsLabelOpen(!isLabelOpen)}>
                {`$${calculateMyPosition(myPoolPosition)}`}
              </Text>
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

