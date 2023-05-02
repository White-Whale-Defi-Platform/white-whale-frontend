import { VStack } from '@chakra-ui/react'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { WalletStatusType } from 'state/atoms/walletAtoms'
import Input from 'components/AssetInput/Input'
import ShowError from 'components/ShowError'
import SubmitButton from 'components/SubmitButton'
import useWithdraw, { useSimulateWithdraw } from './hooks/useWithdraw'

type Props = {
  poolId: string
  connected: WalletStatusType
}

const WithdrawForm = ({ poolId, connected }: Props) => {
  const [
    {
      swap_address: swapAddress = null,
      lp_token: contract = null,
      liquidity
    } = {}
  ] = useQueryPoolLiquidity({ poolId })

  const [reverse, setReverse] = useState(false)
  const [assetA, assetB] = poolId?.split('-') || []

  const { tokenABalance, tokenBBalance } = useMemo(() => {
    const [reserveA, reserveB] = liquidity?.reserves?.totalProvided || []
    // console.log({ reserveA, reserveB, liquidity })
    return {
      tokenABalance: fromChainAmount(reserveA),
      tokenBBalance: fromChainAmount(reserveB)
    }
  }, [liquidity?.reserves?.totalProvided])

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

  const tx = useWithdraw({ amount: lp, contract, swapAddress, poolId })

  const isConnected = connected === WalletStatusType.connected
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

      <Input
        control={control}
        name="token1"
        token={tokenA}
        isDisabled={isInputDisabled}
        balance={num(tokenABalance).toNumber()}
        fetchBalance={false}
        onChange={(value) => {
          if (reverse)
            setReverse(false)
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
          if (!reverse)
            setReverse(true)
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
        show={tx?.error && !!!tx.buttonLabel}
        message={tx?.error as string}
      />

    </VStack>
  )
}

export default WithdrawForm
