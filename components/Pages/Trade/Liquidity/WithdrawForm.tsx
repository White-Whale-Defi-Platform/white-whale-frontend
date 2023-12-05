import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import useClaimableLP from 'components/Pages/Trade/Liquidity/hooks/useClaimableLP'
import useWithdraw, { useSimulateWithdraw } from 'components/Pages/Trade/Liquidity/hooks/useWithdraw'
import { useQueryPoolLiquidity } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import ShowError from 'components/ShowError'
import SubmitButton from 'components/SubmitButton'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { TxStep } from 'types/index'
import { getDecimals } from 'util/conversion/index'

type Props = {
  poolId: string
  isWalletConnected: boolean
  mobile?: boolean
  openView: any
  clearForm: () => void
}

const WithdrawForm = ({ poolId, isWalletConnected, clearForm, mobile, openView }: Props) => {
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
  const [tokenSymbolA, tokenSymbolB] = poolId?.split('-') || []
  const lpBalance = liquidity?.available?.provided?.tokenAmount || 0
  const [tokenList] = useTokenList()
  const { tokenABalance, tokenBBalance } = useMemo(() => {
    const [reserveA, reserveB] = liquidity?.reserves?.myNotLocked || []

    return {
      tokenABalance: fromChainAmount(reserveA, getDecimals(tokenSymbolA, tokenList)),
      tokenBBalance: fromChainAmount(reserveB, getDecimals(tokenSymbolB, tokenList)),
    }
  }, [liquidity])

  const { control, handleSubmit, setValue, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1: {
        tokenSymbol: tokenSymbolA,
        amount: 0,
        decimals: getDecimals(tokenSymbolA, tokenList),
      },
      token2: {
        tokenSymbol: tokenSymbolB,
        amount: 0,
        decimals: getDecimals(tokenSymbolB, tokenList),
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
      ? toChainAmount(tokenB.amount, getDecimals(tokenSymbolB, tokenList))
      : toChainAmount(tokenA.amount, getDecimals(tokenSymbolA, tokenList)),
    reverse,
  })

  useEffect(() => {
    if (reverse) {
      setValue('token1', {
        ...tokenA,
        amount: num(fromChainAmount(simulated, tokenA.decimals)).toNumber(),
      })
    } else {
      setValue('token2', {
        ...tokenB,
        amount: num(fromChainAmount(simulated, tokenB.decimals)).toNumber(),
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

  const isInputDisabled = tx?.txStep === TxStep.Posting

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (!tokenA?.amount) {
      return 'Enter Amount'
    } else if (tx?.buttonLabel) {
      return tx?.buttonLabel
    }
    return 'Withdraw'
  }, [tx?.buttonLabel, isWalletConnected, tokenA, tokenB, lp, lpBalance])

  useEffect(() => {
    if (tx?.txStep === TxStep.Success) {
      setValue('token1', { ...tokenA,
        amount: 0 })
      setValue('token2', { ...tokenB,
        amount: 0 })
      clearForm()
    }
  }, [tx?.txStep])

  // On input change reset input or update value
  const onInputChange = (value, asset) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      tx.reset()
    }

    if (asset === 1) {
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
      onSubmit={isWalletConnected ? handleSubmit(tx?.submit) : handleSubmit(openView)}
    >
      <Input
        control={control}
        name="token1"
        token={tokenA}
        isDisabled={isInputDisabled}
        balance={num(tokenABalance).toNumber()}
        fetchBalance={false}
        mobile={mobile}
        ignoreSlack={true}
        onChange={(value) => {
          if (reverse) {
            setReverse(false)
          }
          onInputChange(value, 1)
        }}
      />
      <Input
        control={control}
        ignoreSlack={true}
        name="token2"
        token={tokenB}
        isDisabled={isInputDisabled}
        balance={num(tokenBBalance).toNumber()}
        fetchBalance={false}
        mobile={mobile}
        onChange={(value) => {
          if (!reverse) {
            setReverse(true)
          }
          onInputChange(value, 2)
        }}
      />

      <SubmitButton
        label={buttonLabel as string}
        isConnected={isWalletConnected}
        txStep={tx?.txStep}
        isDisabled={(tx.txStep !== TxStep.Ready) && isWalletConnected}
      />

      <ShowError
        show={tx?.error && Boolean(!tx.buttonLabel)}
        message={tx?.error as string}
      />
    </VStack>
  )
}

export default WithdrawForm
