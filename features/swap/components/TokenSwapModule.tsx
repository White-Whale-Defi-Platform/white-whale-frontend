import { useEffect, useRef } from 'react'

import { useTokenList } from 'hooks/useTokenList'
import { styled, useMedia, usePersistance } from 'junoblocks'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  TransactionStatus,
  transactionStatusState,
} from 'state/atoms/transactionAtoms'

import { useTokenToTokenPrice } from '../hooks'
import { tokenSwapAtom } from '../swapAtoms'
import { TokenSelector } from './TokenSelector'
import { TransactionAction } from './TransactionAction'
import { TransactionTips } from './TransactionTips'

type TokenSwapModuleProps = {
  /* will be used if provided on first render instead of internal state */
  initialTokenPair?: readonly [string, string]
}

export const TokenSwapModule = ({ initialTokenPair }: TokenSwapModuleProps) => {
  /* connect to recoil */
  const [[tokenA, tokenB], setTokenSwapState] = useRecoilState(tokenSwapAtom)
  const transactionStatus = useRecoilValue(transactionStatusState)

  /* fetch token list and set initial state */
  const [tokenList, isTokenListLoading] = useTokenList()
  useEffect(() => {
    const shouldSetDefaultTokenAState =
      !tokenA.tokenSymbol && !tokenB.tokenSymbol && tokenList
    if (shouldSetDefaultTokenAState) {
      setTokenSwapState([
        {
          tokenSymbol: tokenList.base_token.symbol,
          amount: tokenA.amount || 0,
        },
        tokenB,
      ])
    }
  }, [tokenList, tokenA, tokenB, setTokenSwapState])

  useEffect(() => {
    // if (initialTokenPairValue) {
    const [tokenASymbol, tokenBSymbol] = initialTokenPair || []
    setTokenSwapState([
      {
        tokenSymbol: tokenASymbol,
        amount: 0,
      },
      {
        tokenSymbol: tokenBSymbol,
        amount: 0,
      },
    ])
  }, [initialTokenPair])

  const isUiDisabled =
    transactionStatus === TransactionStatus.EXECUTING || isTokenListLoading
  const uiSize = useMedia('sm') ? 'small' : 'large'

  /* fetch token to token price */
  const [currentTokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol: tokenA?.tokenSymbol,
    tokenBSymbol: tokenB?.tokenSymbol,
    tokenAmount: tokenA?.amount,
  })

  /* persist token price when querying a new one */
  const persistTokenPrice = usePersistance(
    isPriceLoading ? undefined : currentTokenPrice
  )

  /* select token price */
  const tokenPrice =
    (isPriceLoading ? persistTokenPrice : currentTokenPrice) || 0

  const handleSwapTokenPositions = () => {
    setTokenSwapState([
      tokenB ? { ...tokenB, amount: tokenPrice } : tokenB,
      tokenA ? { ...tokenA, amount: tokenB.amount } : tokenA,
    ])
  }

  return (
    <>
      <StyledDivForWrapper>
        <TokenSelector
          tokenSymbol={tokenA.tokenSymbol}
          amount={tokenA.amount}
          onChange={(updateTokenA) => {
            setTokenSwapState([updateTokenA, tokenB])
          }}
          disabled={isUiDisabled}
          size={uiSize}
        />
        <TransactionTips
          disabled={isUiDisabled}
          isPriceLoading={isPriceLoading}
          tokenToTokenPrice={tokenPrice}
          onTokenSwaps={handleSwapTokenPositions}
          size={uiSize}
        />
        <TokenSelector
          readOnly
          tokenSymbol={tokenB.tokenSymbol}
          amount={tokenPrice}
          onChange={(updatedTokenB) => {
            setTokenSwapState([tokenA, updatedTokenB])
          }}
          disabled={isUiDisabled}
          size={uiSize}
        />
      </StyledDivForWrapper>
      <TransactionAction
        isPriceLoading={isPriceLoading}
        tokenToTokenPrice={tokenPrice}
        size={uiSize}
      />
    </>
  )
}

const StyledDivForWrapper = styled('div', {
  borderRadius: '8px',
  // backgroundColor: '$colors$dark10',
  backgroundColor: 'White',
})
