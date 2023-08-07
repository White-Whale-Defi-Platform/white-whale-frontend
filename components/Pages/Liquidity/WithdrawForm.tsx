import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import ShowError from 'components/ShowError'
import SubmitButton from 'components/SubmitButton'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { useQueryPoolLiquidity } from 'queries/useQueryPoolsLiquidity'

import useClaimableLP from './hooks/useClaimableLP'
import useWithdraw, { useSimulateWithdraw } from './hooks/useWithdraw'
import { WalletStatus } from '@cosmos-kit/core'

type Props = {
  poolId: string
  connected: WalletStatus
  clearForm: () => void
}

const WithdrawForm = ({ poolId, connected, clearForm }: Props) => {
  const [
    {
      swap_address: swapAddress = null,
      lp_token: contract = null,
      liquidity = {},
      staking_address = null,
    } = {},
  ] = useQueryPoolLiquidity({ poolId })

  const claimableLP = useClaimableLP({ poolId })

  const [reverse, setReverse] = useState(false)
  const [assetA, assetB] = poolId?.split('-') || []
  const lpBalance = liquidity?.available?.provided?.tokenAmount || 0

  const { tokenABalance, tokenBBalance } = useMemo(() => {
    const [reserveA, reserveB] = liquidity?.reserves?.myNotLocked || []

    return {
      tokenABalance: fromChainAmount(reserveA),
      tokenBBalance: fromChainAmount(reserveB),
    }
  }, [liquidity])

  const { control, handleSubmit, setValue, watch } = useForm({
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
    lp: liquidity?.available?.provided?.tokenAmount,
    tokenA: liquidity?.reserves?.myNotLocked?.[0],
    tokenB: liquidity?.reserves?.myNotLocked?.[1],
    amount: reverse
      ? toChainAmount(tokenB.amount)
      : toChainAmount(tokenA.amount),
    reverse,
  })

  useEffect(() => {
    if (reverse) {
      setValue('token1', {
        ...tokenA,
        amount: num(fromChainAmount(simulated)).toNumber(),
      })
    } else {
      setValue('token2', {
        ...tokenB,
        amount: num(fromChainAmount(simulated)).toNumber(),
      })
    }
  }, [simulated])

  const tx = useWithdraw({
    amount: lp || '0',
    contract,
    swapAddress,
    claimIncentive: claimableLP > 0,
    stakingAddress: staking_address,
  })

  const isConnected = connected === WalletStatus.Connected
  const isInputDisabled = tx?.txStep == TxStep.Posting

  const buttonLabel = useMemo(() => {
    if (connected !== WalletStatus.Connected) {
      return 'Connect Wallet'
    } else if (!tokenA?.amount) {
      return 'Enter Amount'
    }
    // Else if (!isFinite(Number(lp)) || Number(lp) > lpBalance) return 'Insufficient funds'
    else if (tx?.buttonLabel) {
      return tx?.buttonLabel
    }
    return 'Withdraw'
  }, [tx?.buttonLabel, connected, tokenA, tokenB, lp, lpBalance])

  useEffect(() => {
    if (tx?.txStep === TxStep.Success) {
      setValue('token1', { ...tokenA, amount: 0 })
      setValue('token2', { ...tokenB, amount: 0 })
      clearForm()
      // Tx?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.txStep])

  // On input change reset input or update value
  const onInputChange = (value, asset) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      tx.reset()
    }

    if (asset == 1) {
      setValue('token1', value)
    } else {
      setValue('token2', value)
    }
  }

  // Reset form on success
  useEffect(() => {
    if (tx.txStep === TxStep.Success) {
      setValue('token1', {
        ...tokenA,
        amount: 0,
      })
      setValue('token2', {
        ...tokenB,
        amount: 0,
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
      <Input
        control={control}
        name="token1"
        token={tokenA}
        isDisabled={isInputDisabled}
        balance={num(tokenABalance).toNumber()}
        fetchBalance={false}
        onChange={(value) => {
          if (reverse) {
            setReverse(false)
          }
          onInputChange(value, 1)
        }}
      />

      <Input
        control={control}
        name="token2"
        token={tokenB}
        isDisabled={isInputDisabled}
        balance={num(tokenBBalance).toNumber()}
        fetchBalance={false}
        onChange={(value) => {
          if (!reverse) {
            setReverse(true)
          }
          onInputChange(value, 2)
        }}
      />

      <SubmitButton
        label={buttonLabel as string}
        isConnected={isConnected}
        txStep={tx?.txStep}
        isDisabled={tx.txStep != TxStep.Ready || !isConnected}
      />

      <ShowError
        show={tx?.error && Boolean(!tx.buttonLabel)}
        message={tx?.error as string}
      />
    </VStack>
  )
}

export default WithdrawForm
