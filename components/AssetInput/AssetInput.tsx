import { VStack, forwardRef} from '@chakra-ui/react'
import React, { useCallback, useMemo } from 'react'
import { useTokenDollarValue } from 'hooks/useTokenDollarValue'
import BalanceWithMax from './BalanceWithMax'
import WhaleInput from './WhaleInput'
import { num } from '../../libs/num'
import { useBaseTokenInfo, useTokenInfo } from 'hooks/useTokenInfo'

interface AssetInputProps {
  image?: boolean
  token: any
  value: any
  onChange: (value: any, isTokenChange?: boolean) => void
  showList?: boolean
  onInputFocus?: () => void
  balance?: number
  disabled?: boolean
  minMax?: boolean
  isSingleInput?: boolean
  hideToken?: string
  edgeTokenList?: string[]
  ignoreSlack?: boolean
  hideMax?: boolean
}

const AssetInput = forwardRef(( props : AssetInputProps, ref) => {
  const { balance, disabled, isSingleInput, token, onChange, ignoreSlack, hideMax } = props
  const tokenInfo = useTokenInfo(token?.tokenSymbol)
  const baseToken = useBaseTokenInfo()

  const onMaxClick = useCallback(() => {
    const isTokenAndBaseTokenSame = tokenInfo?.symbol === baseToken?.symbol
    onChange({
      ...token,
      amount: isTokenAndBaseTokenSame && !ignoreSlack
        ? num(balance - 0.1).toFixed(6)
        : num(balance).toFixed(6),
    })
  }, [tokenInfo, baseToken, ignoreSlack, onChange])

  const maxDisabled = useMemo(() => {
    return disabled || (!isSingleInput && !tokenInfo?.symbol)
  }, [balance, disabled, isSingleInput, tokenInfo])

  const numberOfTokens = useMemo(() => `${token?.amount} ${token.tokenSymbol}`, [token])

  const [tokenPrice] = useTokenDollarValue(token?.tokenSymbol)

  const dollarValue = useMemo(() => {
    return num(tokenPrice)
      .times(token?.amount)
      .dp(6)
      .toString()
  }, [tokenPrice, token?.amount])

  const balanceWithDecimals = useMemo(() => num(balance).dp(token.decimals).toString(), [balance, token.decimals]);


  return (
    <VStack width="full">
      <WhaleInput {...props} />
      <BalanceWithMax
        balance={balanceWithDecimals}
        hideDollarValue={true}
        numberOfTokens={numberOfTokens}
        dollarValue={dollarValue}
        maxDisabled={maxDisabled}
        hideMax={hideMax}
        onMaxClick={onMaxClick}
      />
    </VStack>
  )
})

export default AssetInput