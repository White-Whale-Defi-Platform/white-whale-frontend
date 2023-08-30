import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import { useConfig } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useRecoilState, useRecoilValue } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'

import AssetInput from '../../AssetInput'
import { bondingAtom } from './bondAtoms'

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
  const [currentBondState, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingAtom)
  const { status, network, chainId } = useRecoilValue(walletState)

  const isWalletConnected = status === WalletStatusType.connected

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
        tokenSymbol: config.bonding_tokens[0].tokenSymbol,
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
    <VStack px={7} width="full">
      <Controller
        name="currentBondState"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            isBonding={true}
            hideToken={currentBondState.tokenSymbol}
            {...field}
            token={currentBondState}
            balance={currentTokenBalance}
            minMax={false}
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
