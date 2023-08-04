import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { VStack } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { chainState, WalletStatusType } from 'state/atoms/chainState'
import AssetInput from '../../AssetInput'
import { AMP_WHALE_TOKEN_SYMBOL } from 'constants/bondingContract'
import { LSDToken, LSDTokenBalances, LSDTokenItemState } from './Bond'
import { bondingAtom } from './bondAtoms'

const Unbond = ({ bondedAmpWhale, bondedBWhale }) => {
  const [{ status }] = useRecoilState(chainState)
  const [currentBondState, setCurrentBondState] =
    useRecoilState<LSDTokenItemState>(bondingAtom)

  const isWalletConnected = status === WalletStatusType.connected

  const [tokenBalances, setLSDTokenBalances] = useState<LSDTokenBalances>(null)

  useEffect(() => {
    setLSDTokenBalances({
      ampWHALE: bondedAmpWhale,
      bWHALE: bondedBWhale,
    })
  }, [bondedAmpWhale, bondedBWhale])

  const onInputChange = useCallback(
    (tokenSymbol: string | null, amount: number) => {
      if (tokenSymbol) {
        setCurrentBondState({
          ...currentBondState,
          tokenSymbol: tokenSymbol,
          amount: Number(amount),
        })
      } else {
        setCurrentBondState({ ...currentBondState, amount: Number(amount) })
      }
    },
    [currentBondState]
  )

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

  const unbondingBalances = useMemo(
    () => ({ ampWHALE: bondedAmpWhale, bWHALE: bondedBWhale }),
    [bondedAmpWhale, bondedBWhale]
  )

  return (
    <VStack px={7} width="full">
      <Controller
        name="currentBondState"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            isBonding={true}
            unbondingBalances={unbondingBalances}
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
                  return 0 // or any other default value
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

export default Unbond
