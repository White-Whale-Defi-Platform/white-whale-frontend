import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { TxStep } from 'hooks/useTransaction'
import { num } from 'libs/num'

import { WalletStatusType } from 'state/atoms/walletAtoms'
import { TokenItemState } from 'types/index'

type Props = {
  connected: WalletStatusType
  tokenA: TokenItemState
  tokenB: TokenItemState
  tx: any
  simulated: string | null
  onInputChange: (asset: TokenItemState, index: number) => void
  setReverse: (value: boolean) => void
  reverse: boolean
  poolId: string
  setBondingDays: (value: number) => void
  bondingDays: number
}

const DepositForm = ({
  tokenA,
  tokenB,
  onInputChange,
  connected,
  tx,
  simulated,
  setReverse,
  reverse,
  bondingDays,
  setBondingDays,
  poolId
}: Props) => {
  const { balance: tokenABalance } = useTokenBalance(tokenA?.tokenSymbol)
  const { balance: tokenBBalance, isLoading: tokanBloading } = useTokenBalance(
    tokenB?.tokenSymbol
  )

  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1: tokenA,
      token2: tokenB,
    },
  })

  const isInputDisabled = tx?.txStep == TxStep.Posting
  const isConnected = connected === WalletStatusType.connected
  const amountA = getValues('token1')

  useEffect(() => {
    if (simulated) {
      if (reverse) {
        onInputChange({ ...tokenA, amount: num(simulated).dp(6).toNumber() }, 0)
        setValue('token1', {
          ...tokenA,
          amount: num(simulated).dp(6).toNumber(),
        })
      } else {
        onInputChange({ ...tokenB, amount: num(simulated).dp(6).toNumber() }, 1)
        setValue('token2', {
          ...tokenA,
          amount: num(simulated).dp(6).toNumber(),
        })
      }
    } else {
      if (reverse) {
        if (!!!tokenB.amount)
          setValue('token1', { ...tokenA, amount: undefined })
      } else {
        if (!!!tokenA.amount)
          setValue('token2', { ...tokenB, amount: undefined })
      }
    }

    return () => {
      onInputChange({ ...tokenA, amount: 0 }, 0)
      tx?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated, reverse])

  

  const buttonLabel = useMemo(() => {
    if (connected !== WalletStatusType.connected) return 'Connect Wallet'
    else if (!tokenB?.tokenSymbol) return 'Select Token'
    else if (!!!amountA?.amount) return 'Enter Amount'
    else if (tx?.buttonLabel) return tx?.buttonLabel
    else return 'Deposit'
  }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, amountA])

  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={handleSubmit(tx?.submit)}
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <Controller
          name="token1"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              {...field}
              token={tokenA}
              disabled={isInputDisabled}
              balance={tokenABalance}
              showList={false}
              onChange={(value) => {
                setReverse(false)
                onInputChange(value, 0)
                field.onChange(value)
              }}
            />
          )}
        />
      </VStack>

      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <HStack>
          <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">
            Balance:{' '}
          </Text>
          {tokanBloading ? (
            <Spinner color="white" size="xs" />
          ) : (
            <Text fontSize="14" fontWeight="700">
              {tokenBBalance?.toFixed(6)}
            </Text>
          )}
        </HStack>
        <Controller
          name="token2"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              {...field}
              disabled={isInputDisabled || !tokenB?.tokenSymbol}
              token={tokenB}
              balance={tokenBBalance}
              showList={false}
              onChange={(value) => {
                setReverse(true)
                onInputChange(value, 1)
                field.onChange(value)
              }}
            />
          )}
        />
      </VStack>

      <Button
        type="submit"
        width="full"
        variant="primary"
        isLoading={
          tx?.txStep == TxStep.Estimating ||
          tx?.txStep == TxStep.Posting ||
          tx?.txStep == TxStep.Broadcasting
        }
        disabled={
          tx.txStep != TxStep.Ready || simulated == null || !isConnected
        }
      >
        {buttonLabel}
      </Button>

      {tx?.error && !!!tx.buttonLabel && (
        <Text color="red" fontSize={12}>
          {' '}
          {tx?.error}{' '}
        </Text>
      )}
    </VStack>
  )
}

export default DepositForm
