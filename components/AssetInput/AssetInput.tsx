import { useMemo } from 'react';

import { VStack, forwardRef } from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Dashboard/BondingActions/Bond'
import {
  AMP_WHALE_TOKEN_SYMBOL,
  B_WHALE_TOKEN_SYMBOL,
  WHALE_TOKEN_SYMBOL,
} from 'constants/index'
import usePrices from 'hooks/usePrices'
import { useBaseTokenInfo, useTokenInfo } from 'hooks/useTokenInfo'
import { num } from 'libs/num'

import BalanceWithMaxNHalf from './BalanceWithMax'
import WhaleInput from './WhaleInput'

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
  unbondingBalances?: TokenBalance[]
  mobile?: boolean
}

const AssetInput = forwardRef((props: AssetInputProps, ref) => {
  const {
    balance,
    disabled,
    isSingleInput,
    token,
    onChange,
    ignoreSlack,
    hideMax,
    hideDollarValue,
    mobile,
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
  const maxDisabled = useMemo(() => disabled || (!isSingleInput && !tokenInfo?.symbol),
    [balance, disabled, isSingleInput, tokenInfo])

  const formatNumber = (num: number, decimalPlaces: number) => {
    const parts = num.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    parts[1] = parts[1]?.substring(0, decimalPlaces).replace(/0+$/, '')
    return parts[1] ? parts.join('.') : parts[0]
  }

  const numberOfTokens = useMemo(() => `${formatNumber(token?.amount, 6)} ${token?.tokenSymbol}`,
    [token])
  const prices = usePrices()
  const tokenSymbol = useMemo(() => (token?.tokenSymbol === AMP_WHALE_TOKEN_SYMBOL ||
      token?.tokenSymbol === B_WHALE_TOKEN_SYMBOL
    ? WHALE_TOKEN_SYMBOL
    : token?.tokenSymbol),
  [token])
  const dollarValue = useMemo(() => num(prices?.[tokenSymbol]).times(token?.amount).
    dp(6).
    toFixed(2),
  [tokenSymbol, prices, token?.amount])

  const balanceWithDecimals = useMemo(() => num(balance).
    dp(token?.decimals || 6).
    toString(),
  [balance, token?.decimals])

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
        mobile={mobile}
      />
    </VStack>
  )
})

export default AssetInput
