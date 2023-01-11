import React, { useState } from 'react'

import {
  Button,
  Column,
  dollarValueFormatterWithDecimals,
  Exchange,
  formatTokenBalance,
  IconWrapper,
  Inline,
  styled,
  Text,
} from 'junoblocks'
import { useRecoilValue } from 'recoil'

import { useTxRates } from '../hooks'
import { tokenSwapAtom } from '../swapAtoms'

type TransactionTipsProps = {
  isPriceLoading: boolean
  tokenToTokenPrice: number
  onTokenSwaps: () => void
  disabled?: boolean
  size?: 'large' | 'small'
}

export const TransactionTips = ({
  isPriceLoading,
  tokenToTokenPrice,
  onTokenSwaps,
  disabled,
  size = 'large',
}: TransactionTipsProps) => {
  const [swappedPosition, setSwappedPositions] = useState(false)
  const [tokenA, tokenB] = useRecoilValue(tokenSwapAtom)

  const { isShowing, conversionRate, conversionRateInDollar, dollarValue } =
    useTxRates({
      tokenASymbol: tokenA?.tokenSymbol,
      tokenBSymbol: tokenB?.tokenSymbol,
      tokenAAmount: tokenA?.amount,
      tokenToTokenPrice,
      isLoading: isPriceLoading,
    })

  const switchTokensButton = (
    <Button
      icon={<StyledIconWrapper icon={<Exchange />} flipped={swappedPosition} />}
      variant="ghost"
      onClick={
        !disabled
          ? () => {
              setSwappedPositions(!swappedPosition)
              onTokenSwaps()
            }
          : undefined
      }
      iconColor="tertiary"
    />
  )

  const transactionRates = (
    <>
      1 {tokenA.tokenSymbol} ≈ {formatTokenBalance(conversionRate)}{' '}
      {tokenB.tokenSymbol}
      {' ≈ '}$
      {dollarValueFormatterWithDecimals(conversionRateInDollar, {
        includeCommaSeparation: true,
      })}
    </>
  )

  const formattedDollarValue = dollarValueFormatterWithDecimals(dollarValue, {
    includeCommaSeparation: true,
  })

  if (size === 'small') {
    return (
      <Inline
        justifyContent="space-between"
        css={{
          padding: isShowing ? '$10 $12 $10 $9' : '$11 $12 $11 $9',
          borderTop: '1px solid $borderColors$inactive',
          borderBottom: '1px solid $borderColors$inactive',
        }}
      >
        {switchTokensButton}
        {isShowing && (
          <Column align="flex-end" gap={2}>
            <Text variant="caption" color="disabled" wrap={false}>
              {transactionRates}
            </Text>
            <Text variant="caption" color="disabled" wrap={false}>
              Swap estimate: ${formattedDollarValue}
            </Text>
          </Column>
        )}
      </Inline>
    )
  }

  return (
    <StyledDivForWrapper>
      <StyledDivForRateWrapper>
        {switchTokensButton}

        {isShowing && (
          <Text variant="legend" wrap={false}>
            {transactionRates}
          </Text>
        )}
      </StyledDivForRateWrapper>

      <Text variant="legend">${formattedDollarValue}</Text>
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled('div', {
  padding: '$8 $16 $8 $12',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'right',
  borderTop: '1px solid $borderColors$inactive',
  borderBottom: '1px solid $borderColors$inactive',
})

const StyledDivForRateWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  textAlign: 'left',
  columnGap: '$space$6',
})

const StyledIconWrapper = styled(IconWrapper, {
  variants: {
    flipped: {
      true: {
        transform: 'rotateX(180deg)',
      },
      false: {
        transform: 'rotateX(0deg)',
      },
    },
  },
})
