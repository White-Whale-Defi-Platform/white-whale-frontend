import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'

import AssetInput from '../../AssetInput'
import { BondingTokenState, TokenBalance } from './Bond'
import { bondingAtom } from './bondAtoms'
import { BondedData } from 'components/Pages/Dashboard/hooks/getBonded'
import { useConfig } from 'components/Pages/Dashboard/hooks/useDashboardData'

const Unbond = ({ bondedAssets }: { bondedAssets: BondedData[] }) => {
  const { status, chainId, network } = useRecoilValue(walletState)
  const [currentBondState, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingAtom)
  const config = useConfig(network, chainId)
  const isWalletConnected = status === WalletStatusType.connected

  const [bondedBalances, setBondedBalances] = useState<TokenBalance[]>(null)

  useEffect(() => {
    const newBalances = bondedAssets?.map((asset: BondedData) => {
      return { amount: asset.amount, tokenSymbol: asset.tokenSymbol }
    })
    setBondedBalances(newBalances)
  }, [bondedAssets])

  const onInputChange = useCallback(
    (tokenSymbol: string | null, amount: number) => {
      if (tokenSymbol) {
        setCurrentBondState({
          ...currentBondState,
          tokenSymbol,
          amount: Number(amount),
        })
      } else {
        setCurrentBondState({ ...currentBondState, amount: Number(amount) })
      }
    },
    [currentBondState]
  )

  useEffect(() => {
    if (config) {
      const firstToken = config.bonding_tokens[0]
      setCurrentBondState({
        tokenSymbol: firstToken.tokenSymbol,
        amount: 0,
        decimals: 6,
        denom: firstToken.denom,
      })
    }
  }, [isWalletConnected, config])

  const { control } = useForm({
    mode: 'onChange',
    defaultValues: {
      currentBondState,
    },
  })

  const currentTokenBalance = useMemo(
    () =>
      bondedBalances?.find(
        (balance) => balance.tokenSymbol === currentBondState.tokenSymbol
      )?.amount,
    [bondedBalances, currentBondState.tokenSymbol]
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
            unbondingBalances={bondedBalances}
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

export default Unbond
