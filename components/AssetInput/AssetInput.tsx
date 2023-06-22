import { VStack, forwardRef } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useTokenDollarValue } from 'hooks/useTokenDollarValue'
import WhaleInput from './WhaleInput'
import { num } from 'libs/num'
import { useBaseTokenInfo, useTokenInfo } from 'hooks/useTokenInfo'
import BalanceWithMaxNHalf from './BalanceWithMax'

interface AssetInputProps {
  image?: boolean
  token: any
  value: any
  onChange: (value: any, isTokenChange?: boolean) => void
  showList?: boolean
  onInputFocus?: () => void
  balance?: number
  whalePrice?: number
  disabled?: boolean
  minMax?: boolean
  isSingleInput?: boolean
  hideToken?: string
  edgeTokenList?: string[]
  ignoreSlack?: boolean
  hideMax?: boolean
  hideDollarValue?: boolean
  showBalanceSlider?: boolean
  isBonding?: boolean
  unbondingBalances?: { [key: string]: number }
}

const AssetInput = forwardRef((props: AssetInputProps, ref) => {
  const {
    balance,
    disabled,
    isSingleInput,
    whalePrice,
    token,
    onChange,
    ignoreSlack,
    hideMax,
    hideDollarValue,
  } = props
  const tokenInfo = useTokenInfo(token?.tokenSymbol)
  const baseToken = useBaseTokenInfo()

  const onMaxClick = () => {
    const isTokenAndBaseTokenSame = tokenInfo?.symbol === baseToken?.symbol
    onChange({
      ...token,
      amount:
        isTokenAndBaseTokenSame && !ignoreSlack
          ? num(balance === 0 ? 0 : balance - 0.1).toFixed(6)
          : num(balance).toFixed(6),
    })
  }
  const onHalfClick = () => {
    onChange({
      ...token,
      amount: num(balance === 0 ? 0 : balance / 2).toFixed(6),
    })
  }
  const maxDisabled = useMemo(() => {
    return disabled || (!isSingleInput && !tokenInfo?.symbol)
  }, [balance, disabled, isSingleInput, tokenInfo])

  const numberOfTokens = useMemo(
    () => `${token?.amount} ${token?.tokenSymbol}`,
    [token]
  )
  //TODO reason no price in swap form, resolve by !!whalePrice ? ...
  const [tokenPrice] =
    whalePrice !== null ? [whalePrice] : useTokenDollarValue(token?.tokenSymbol)

  const dollarValue = useMemo(() => {
    return num(tokenPrice).times(token?.amount).dp(6).toString()
  }, [tokenPrice, token?.amount])

  const balanceWithDecimals = useMemo(
    () =>
      num(balance)
        .dp(token?.decimals || 6)
        .toString(),
    [balance, token?.decimals]
  )

  return (
    <VStack width="full">
      <WhaleInput {...props} />
      <BalanceWithMaxNHalf
        balance={balanceWithDecimals}
        hideDollarValue={hideDollarValue}
        numberOfTokens={numberOfTokens}
        dollarValue={dollarValue}
        maxDisabled={maxDisabled}
        hideMax={hideMax}
        onMaxClick={onMaxClick}
        onHalfClick={onHalfClick}
      />
    </VStack>
  )
})

export default AssetInput
