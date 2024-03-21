import { useEffect, useMemo, useState } from 'react';

import { VStack, forwardRef } from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { usePrices } from 'hooks/usePrices'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { num } from 'libs/num'

import BalanceWithMaxNHalf from './BalanceWithMax'
import WhaleInput from './WhaleInput'

interface AssetInputProps {
  showLogo?: boolean
  token: any
  value: any
  onChange: (value: any, isTokenChange?: boolean) => void
  showList?: boolean
  onInputFocus?: () => void
  balance?: number
  whalePrice?: number
  disabled?: boolean
  hideHalfMax?: boolean
  isSingleInput?: boolean
  hideToken?: string
  edgeTokenList?: string[]
  ignoreSlack?: boolean
  hideDollarValue?: boolean
  showBalanceSlider?: boolean
  isBonding?: boolean
  unbondingBalances?: TokenBalance[]
  mobile?: boolean
  fee?: any
}

const AssetInput = forwardRef((props: AssetInputProps, _) => {
  const {
    balance,
    disabled,
    isSingleInput,
    token,
    onChange,
    ignoreSlack,
    hideHalfMax,
    hideDollarValue,
    mobile,
    fee = null,
  } = props
  const tokenInfo = useTokenInfo(token?.tokenSymbol)
  const [maxClicked, setMaxClicked] = useState(false)
  const onMaxClick = () => {
    onChange({
      ...token,
      amount:
        num(balance).toFixed(tokenInfo?.decimals || 6),
    })
    setMaxClicked(true)
  }
  const onHalfClick = () => {
    onChange({
      ...token,
      amount: num(balance === 0 ? 0 : balance / 2).toFixed(tokenInfo?.decimals || 6),
    })
  }
  const maxDisabled = useMemo(() => disabled || (!isSingleInput && !tokenInfo?.symbol),
    [balance, disabled, isSingleInput, tokenInfo])

  const formatNumber = (num: number, decimalPlaces: number) => {
    if (!num) {
      return 0
    }
    const parts = num?.toString()?.split('.')
    parts[0] = parts?.[0]?.replace(/\B(?=(?<temp1>\d{3})+(?!\d))/gu, ',')
    parts[1] = parts?.[1]?.substring(0, decimalPlaces)?.replace(/0+$/u, '')
    return parts?.[1] ? parts.join('.') : parts?.[0]
  }

  const tokenNumberString = useMemo(() => `${formatNumber(token?.amount, 2)} ${token?.tokenSymbol}`,
    [token])
  const prices = usePrices()

  const dollarValue = useMemo(() => num(prices?.[token?.tokenSymbol]).times(token?.amount).
    dp(token?.decimals || 6).
    toFixed(2),
  [prices, token])

  const balanceWithDecimals = useMemo(() => num(balance).dp(token?.decimals || 6).
    toString(),
  [balance, token?.decimals])

  useEffect(() => {
    const isTokenAndBaseTokenSame = tokenInfo?.denom === fee?.amount[0].denom
    if (isTokenAndBaseTokenSame && maxClicked && fee) {
      const cost = (Number(fee?.amount[0].amount) * 3) / 10 ** (tokenInfo?.decimals || 6)
      onChange({
        ...token,
        amount:
          isTokenAndBaseTokenSame && !ignoreSlack
            ? num(balance === 0 ? 0 : balance - cost).toFixed(tokenInfo?.decimals || 6)
            : num(balance).toFixed(tokenInfo?.decimals || 6),
      })
      setMaxClicked(false)
    } else if (maxClicked && fee) {
      onChange({
        ...token,
        amount:
          num(balance).toFixed(tokenInfo?.decimals || 6),
      })
      setMaxClicked(false)
    }
  }, [maxClicked, fee])
  return (
    <VStack width="full">
      <WhaleInput {...props} />
      <BalanceWithMaxNHalf
        balance={balanceWithDecimals}
        hideDollarValue={hideDollarValue}
        tokenNumberString={tokenNumberString}
        dollarValue={dollarValue}
        maxDisabled={maxDisabled}
        hideHalfMax={hideHalfMax}
        onMaxClick={onMaxClick}
        onHalfClick={onHalfClick}
        mobile={mobile}
      />
    </VStack>
  )
})

export default AssetInput
