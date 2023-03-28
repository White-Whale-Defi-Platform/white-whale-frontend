import { useEffect, useMemo, useState } from 'react'

import {
  Button,Text, VStack
} from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import { useBaseTokenInfo, useTokenInfo } from 'hooks/useTokenInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'

import { WalletStatusType } from '../../../state/atoms/walletAtoms'
import useWithdraw, {useSimulateWithdraw} from './hooks/useWithdraw'
import { Controller, useForm } from 'react-hook-form'

type Props = {
  poolId: string
  connected: WalletStatusType
}

const WithdrawForm = ({ poolId, connected }: Props) => {
  const [
    {
      swap_address: swapAddress = null,
      lp_token: contract = null,
      pool_id,
      liquidity
    } = {}
  ] = useQueryPoolLiquidity({ poolId })

  
  const [reverse, setReverse] = useState(false)
  
  const [assetA, assetB] = poolId?.split('-') || []

  const { tokenABalance, tokenBBalance } = useMemo(() => {
    const [reserveA, reserveB] = liquidity?.reserves?.totalProvided || []
    return {
      tokenABalance: fromChainAmount(reserveA),
      tokenBBalance: fromChainAmount(reserveB)
    }
  }, [liquidity])



  const { control, handleSubmit, formState, setValue, getValues, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1: {
        tokenSymbol: assetA,
        amount: 0,
        decimals: 6,
      },
      token2: {
        tokenSymbol: assetB,
        amount: 0,
        decimals: 6,
      },
    },
  })

  const tokenA = watch('token1')
  const tokenB = watch('token2')

  const { lp, simulated } = useSimulateWithdraw({
    lp: liquidity?.providedTotal?.tokenAmount,
    tokenA: liquidity?.reserves?.totalProvided?.[0],
    tokenB: liquidity?.reserves?.totalProvided?.[1],
    amount: reverse ? toChainAmount(tokenB.amount) : toChainAmount(tokenA.amount),
    reverse
  })

  useEffect(() => {

    if (reverse) {
      setValue('token1', {
        ...tokenA,
        amount: num(fromChainAmount(simulated)).toNumber()
      })
    } else {
      setValue('token2', {
        ...tokenB,
        amount: num(fromChainAmount(simulated)).toNumber()
      })
    }


  }, [simulated])



  // const [token, setToken] = useState<TokenItemState>(tokenAA)
  const tx = useWithdraw({ amount: lp, contract, swapAddress, poolId })
  const baseToken = useBaseTokenInfo()
  const isConnected = connected === `@wallet-state/connected`

  const isInputDisabled = tx?.txStep == TxStep.Posting

  const buttonLabel = useMemo(() => {
    if (connected !== WalletStatusType.connected) return 'Connect Wallet'
    else if (!!!tokenA?.amount) return 'Enter Amount'
    else if (tx?.buttonLabel) return tx?.buttonLabel
    else return 'Withdraw'
  }, [tx?.buttonLabel, connected, tokenA, tokenB])

  // on input change reset input or update value
  const onInputChange = (value, asset) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
      tx.reset()

    if (asset == 1)
      setValue('token1', value)
    else
      setValue('token2', value)
  }

  // reset form on success
  useEffect(() => {
    if (tx.txStep === TxStep.Success) {
      setValue('token1', {
        ...tokenA,
        amount: 0
      })
      setValue('token2', {
        ...tokenB,
        amount: 0
      })
    }

  }, [tx?.txStep])

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
              balance={num(tokenABalance).toNumber()}
              showList={false}
              onChange={(value) => {
                if (reverse)
                  setReverse(false)
                onInputChange(value, 1)
                field.onChange(value)
              }}
            />
          )}
        />
      </VStack>

      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <Controller
          name="token2"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              {...field}
              disabled={isInputDisabled}
              token={tokenB}
              balance={num(tokenBBalance).toNumber()}
              showList={false}
              onChange={(value) => {
                if (!reverse)
                  setReverse(true)
                onInputChange(value, 2)
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
        disabled={tx.txStep != TxStep.Ready || !isConnected}
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

export default WithdrawForm
