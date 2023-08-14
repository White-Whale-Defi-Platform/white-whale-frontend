import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useMediaQuery, VStack } from '@chakra-ui/react'
import { AMP_WHALE_TOKEN_SYMBOL } from 'constants/bonding_contract'
import { useRecoilState } from 'recoil'


import AssetInput from '../../AssetInput'
import { bondingState } from 'state/bondingState'
import { useChain } from '@cosmos-kit/react-lite'


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
const Bond = ({ liquidAmpWhale, liquidBWhale, whalePrice }) => {
  const [isMobile] = useMediaQuery('(max-width: 720px)')
  const [currentBondState, setCurrentBondState] =
    useRecoilState<LSDTokenItemState>(bondingState)
  const { chainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(chainName)

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
        tokenSymbol,
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
      {/* @ts-ignore*/}
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
                  lsdToken,
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
