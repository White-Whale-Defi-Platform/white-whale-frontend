import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useMediaQuery, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import AssetInput from 'components/AssetInput/index'
import { useConfig } from 'components/Pages/Bonding/hooks/useDashboardData';
import { useRecoilState, useRecoilValue } from 'recoil'
import { bondingState } from 'state/bondingState'
import { chainState } from 'state/chainState'

export interface BondingTokenState {
  tokenSymbol: string
  amount: number
  decimals: number
  denom: string
}
export interface TokenBalance {
  amount: number
  tokenSymbol: string
}

export const Bond = ({ balances, tokenSymbols }) => {
  const [isMobile] = useMediaQuery('(max-width: 720px)')
  const [currentBondState, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingState)
  const { network, chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)

  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>(null)

  useEffect(() => {
    if (balances && tokenSymbols) {
      const newBalances = balances?.map((balance: number, idx: number) => ({ amount: balance,
        tokenSymbol: tokenSymbols[idx] }))
      setTokenBalances(newBalances)
    }
  }, [balances, tokenSymbols])

  const onInputChange = (tokenSymbol: string | null, amount: number) => {
    if (tokenSymbol) {
      setCurrentBondState({
        ...currentBondState,
        tokenSymbol,
        amount: Number(amount),
      })
    } else {
      setCurrentBondState({ ...currentBondState,
        amount: Number(amount) })
    }
  }
  const config = useConfig(network, chainId)

  useEffect(() => {
    if (config) {
      setCurrentBondState({
        tokenSymbol: config.bonding_tokens[0].symbol,
        amount: 0,
        decimals: 6,
        denom: config.bonding_tokens[0].denom,
      })
    }
  }, [isWalletConnected, config])

  const { control } = useForm({
    mode: 'onChange',
    defaultValues: {
      currentBondState,
    },
  })
  const currentTokenBalance = useMemo(() => tokenBalances?.find((balance) => balance.tokenSymbol === currentBondState.tokenSymbol)?.amount,
    [tokenBalances, currentBondState.tokenSymbol])
  return (
    <VStack px={7} width="full" >
      <Controller
        name="currentBondState"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            mobile={isMobile}
            isBonding={true}
            hideToken={currentBondState.tokenSymbol}
            {...field}
            token={currentBondState}
            balance={currentTokenBalance}
            hideHalfMax={false}
            disabled={false}
            onChange={(value, isTokenChange) => {
              onInputChange(value, 0)
              field.onChange(value)
              if (isTokenChange) {
                setCurrentBondState({
                  ...currentBondState,
                  tokenSymbol: value.tokenSymbol,
                  amount: value.amount,
                })
              } else {
                setCurrentBondState({
                  ...currentBondState,
                  amount: value.amount,
                })
              }
            }}
          />
        )}
      />
    </VStack>
  )
}
