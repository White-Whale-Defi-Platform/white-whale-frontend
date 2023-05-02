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
import { useOpenPosition } from '../NewPosition/hooks/useOpenPosition'
import { useClosePosition } from '../NewPosition/hooks/useClosePosition'

type Props = {
  poolId: string
  connected: WalletStatusType
}

const OpenPositionForm = ({ poolId, connected }: Props) => {
  const [{ liquidity} = {}] = useQueryPoolLiquidity({ poolId })

  const tokenBalance = useMemo(() => liquidity?.providedTotal?.tokenAmount , [liquidity])

  const { control, handleSubmit, formState, setValue, getValues, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      token: {
        tokenSymbol: poolId,
        amount: 0,
        decimals: 6,
      }
    },
  })

  const token = watch('token')

  // const [token, setToken] = useState<TokenItemState>(tokenAA)
  const open =  useOpenPosition({amount : Number(token.amount), poolId})
  const close =  useClosePosition({amount : Number(token.amount), poolId})
  const baseToken = useBaseTokenInfo()

  // console.log({close})
  
  const isConnected = connected === `@wallet-state/connected`
  // const isInputDisabled = tx?.txStep == TxStep.Posting
  const isInputDisabled = false

  // on input change reset input or update value
  const onInputChange = (value) => {
    // if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
    //   tx.reset()
      setValue('token', value)
  }

  // reset form on success
  // useEffect(() => {
  //   if (tx.txStep === TxStep.Success) {
  //     setValue('token', {
  //       ...token,
  //       amount: 0
  //     })
  //   }

  // }, [tx?.txStep])

  // console.log({tx, tokenBalance, liquidity})

  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={handleSubmit(() => open?.submit())}
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <Controller
          name="token"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              {...field}
              isSingleInput={true}
              token={token}
              disabled={false}
              balance={num(tokenBalance).toNumber()}
              showList={false}
              onChange={(value) => {
                onInputChange(value)
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
        isLoading={open?.isLoading}
        disabled={!isConnected}
      >
        Deposit
      </Button>
      <Button
        onClick={() => close.submit()}
        width="full"
        variant="primary"
        isLoading={close?.isLoading}
        disabled={!isConnected}
      >
        Close
      </Button>
    </VStack>
  )
}

export default OpenPositionForm
