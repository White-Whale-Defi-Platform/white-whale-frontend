import React, { useEffect, useRef, useState } from 'react'

import { Box, Divider, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Dashboard/BondingActions/Bond'

import { TokenType } from './BondingOverview'
import { BondingData } from './types/BondingData'

export interface WhaleTooltipProps {
  data?: BondingData[]
  withdrawableAmpWhale?: number
  withdrawableBWhale?: number
  label: string
  isWalletConnected: boolean
  tokenType?: TokenType
  tokens?: TokenBalance[]
}

export const WhaleTooltip = ({
  label,
  isWalletConnected,
  tokenType,
  data,
  tokens,
}: WhaleTooltipProps) => {
  const sortedTokens = tokens
    ? tokens
    : data
      ? data.
        find((type) => type.tokenType === tokenType).
        tokenBalances.sort((a, b) => b.amount - a.amount)
      : []
  const summedBalancesObject = sortedTokens.reduce((acc, balance) => {
    if (acc[balance.tokenSymbol]) {
      acc[balance.tokenSymbol] += balance.amount
    } else {
      acc[balance.tokenSymbol] = balance.amount
    }
    return acc
  }, {} as Record<string, number>)

  const summedBalanceList: TokenBalance[] = Object.keys(summedBalancesObject).map((key) => ({
    amount: summedBalancesObject[key],
    tokenSymbol: key,
  }))

  const TokenDetail = ({ token }: { token: TokenBalance }) => (
    <HStack justify="space-between" direction="row" width="full" px={2}>
      <Text color="whiteAlpha.600" fontSize={14}>
        {token.tokenSymbol}
      </Text>
      <Text fontSize={14}>{isWalletConnected ? token.amount : 'n/a'}</Text>
    </HStack>
  )

  const textRef = useRef(null)
  const [textWidth, setTextWidth] = useState(0)
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  useEffect(() => {
    setTextWidth(textRef.current.offsetWidth)
  }, [sortedTokens])

  return (
    <Tooltip
      sx={{ boxShadow: 'none' }}
      label={
        (isWalletConnected &&
          !(!data && !tokens) &&
          summedBalanceList.length > 0) ||
        (!data && !tokens) ? (
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
              {!data && !tokens ? (
                <Text>
                  {tokenType === TokenType.liquid
                    ? 'Liquid bonding token balances'
                    : tokenType === TokenType.bonded
                      ? 'Current bonded balances'
                      : tokenType === TokenType.unbonding
                        ? 'Current unbonding balances'
                        : tokenType === TokenType.withdrawable
                          ? 'Current withdrawable balances'
                          : null}
                </Text>
              ) : (
                <>
                  {summedBalanceList?.map((token, index) => (
                    <React.Fragment key={token.tokenSymbol}>
                      <TokenDetail token={token} />
                      {index === 0 && summedBalanceList.length > 1 && (
                        <Divider
                          width="93%"
                          borderWidth="0.1px"
                          color="whiteAlpha.300"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </VStack>
          ) : null
      } // Displaying nothing when wallet disconnected
      bg="transparent"
      isOpen={isLabelOpen}
    >
      <VStack
        alignItems="flex-start"
        minW={100}
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}
      >
        <Text ref={textRef} mb="-0.3rem" color="white">
          {label}
        </Text>
        <Box pb={1}>
          {label !== 'n/a' && (
            <div
              style={{
                width: `${textWidth}px`,
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
          )}
        </Box>
      </VStack>
    </Tooltip>
  )
}
