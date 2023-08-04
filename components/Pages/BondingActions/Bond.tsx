import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { VStack } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'
import AssetInput from '../../AssetInput'
import { bondingAtom } from './bondAtoms'
import { AMP_WHALE_TOKEN_SYMBOL } from 'constants/bondingContract'
import { useChain } from '@cosmos-kit/react-lite'
import { WalletStatus } from '@cosmos-kit/core'

export interface LSDTokenBalances {
  ampWHALE: number
  bWHALE: number
}
export interface LSDTokenItemState {
  tokenSymbol: string
  amount: number
  decimals: number
  lsdToken: LSDToken
}
export enum LSDToken {
  ampWHALE,
  bWHALE,
}
export const Bond = ({ liquidAmpWhale, liquidBWhale }) => {
  const [currentBondState, setCurrentBondState] =
    useRecoilState<LSDTokenItemState>(bondingAtom)
  const { chainName } = useRecoilValue(chainState)
  const { status } = useChain(chainName)

  const isWalletConnected = useMemo(
    () => status === WalletStatus.Connected,
    [status]
  )

  const [tokenBalances, setLSDTokenBalances] = useState<LSDTokenBalances>(null)

  useEffect(() => {
    const newBalances: LSDTokenBalances = {
      ampWHALE: liquidAmpWhale,
      bWHALE: liquidBWhale,
    }
    setLSDTokenBalances(newBalances)
  }, [liquidAmpWhale, liquidBWhale])

  const onInputChange = (tokenSymbol: string | null, amount: number) => {
    if (tokenSymbol) {
      setCurrentBondState({
        ...currentBondState,
        tokenSymbol: tokenSymbol,
        amount: Number(amount),
      })
    } else {
      setCurrentBondState({ ...currentBondState, amount: Number(amount) })
    }
  }

  useEffect(() => {
    setCurrentBondState({
      tokenSymbol: AMP_WHALE_TOKEN_SYMBOL,
      amount: 0,
      decimals: 6,
      lsdToken: LSDToken.ampWHALE,
    })
  }, [isWalletConnected])

  const { control } = useForm({
    mode: 'onChange',
    defaultValues: {
      currentBondState,
    },
  })

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
            balance={(() => {
              switch (currentBondState.lsdToken) {
                case LSDToken.ampWHALE:
                  return tokenBalances?.ampWHALE ?? 0
                case LSDToken.bWHALE:
                  return tokenBalances?.bWHALE ?? 0
                default:
                  return 0
              }
            })()}
            minMax={false}
            disabled={false}
            onChange={(value, isTokenChange) => {
              onInputChange(value, 0)
              field.onChange(value)
              if (isTokenChange) {
                const lsdToken =
                  value.tokenSymbol === AMP_WHALE_TOKEN_SYMBOL
                    ? LSDToken.ampWHALE
                    : LSDToken.bWHALE
                setCurrentBondState({
                  ...currentBondState,
                  tokenSymbol: value.tokenSymbol,
                  amount: value.amount,
                  lsdToken: lsdToken,
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
