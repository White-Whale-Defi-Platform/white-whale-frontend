import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Box,
  Button,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Spinner,
  Text, VStack
} from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { TxStep } from 'hooks/useTransaction'
import { num } from 'libs/num'

import { WalletStatusType } from 'state/atoms/walletAtoms'
import {TokenItemState} from "types/index";
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'

type Props = {
  connected: WalletStatusType
  tokenA: TokenItemState
  tokenB: TokenItemState
  tx: any
  simulated: string | null
  onInputChange: (asset: TokenItemState, index: number) => void
  setReverse: (value: boolean) => void
  reverse: boolean,
  poolId: string
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
  poolId
}: Props) => {

  const [bondingDays, setBondingDays] = useState(0)

  // const [
  //   {
  //     lp_token: contract = null,
  //     pool_id,
  //     liquidity
  //   } = {}
  // ] = useQueryPoolLiquidity({ poolId })

  

  const { balance: tokenABalance } = useTokenBalance(
    tokenA?.tokenSymbol
  )
  const { balance: tokenBBalance, isLoading: tokanBloading } = useTokenBalance(
    tokenB?.tokenSymbol
  )

  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1: tokenA,
      token2: tokenB
    },
  })

  const isInputDisabled = tx?.txStep == TxStep.Posting
  const isConnected = connected === `@wallet-state/connected`

  // console.log({tx})

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

  const amountA = getValues('token1')
  const amountB = getValues('token2')

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

      <VStack width="full" alignItems="flex-start" gap="2" pb="6">
        <TooltipWithChildren label="Unbonding Duration">
          <Text>Some data</Text>
        </TooltipWithChildren>

        <Box width="full">
          <Slider defaultValue={0} value={bondingDays} step={1} min={0} max={365} borderRadius={100} height={1.5} onChange={setBondingDays}>
            <SliderTrack height={1.5} bg="rgba(0, 0, 0, 0.5)" >
              <SliderFilledTrack bg="brand.500" />
            </SliderTrack>
            <SliderThumb boxSize={6} bg="brand.500" />
          </Slider>
        </Box>

        <HStack gap="4">
          <Box px="10" py="2" bg="rgba(0, 0, 0, 0.5)" borderRadius="100px">
            <Text color="white" fontSize="14"> ~{bondingDays} days</Text>
          </Box>
          <Text color="brand.50" fontSize="14">Block 14936784 </Text>
        </HStack>

      </VStack>

      <HStack
        justifyContent="space-between"
        width="full"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="15px"
        p={4}
        pt={3.5}
        style={{marginBottom: 50}}
      >
        <TooltipWithChildren
          label="Multiplicator"
          isHeading
          fontSize="16"
        >
          <Text fontSize="16">Multiplicator</Text>
        </TooltipWithChildren>

        <TooltipWithChildren
          label="3,111"
          fontSize="16"
        >
          <Text fontSize="16">3,111</Text>
        </TooltipWithChildren>
      </HStack>


      <Button
        type="submit"
        width="full"
        variant="primary"
        isLoading={
          tx?.txStep == TxStep.Estimating ||
          tx?.txStep == TxStep.Posting ||
          tx?.txStep == TxStep.Broadcasting
        }
        disabled={tx.txStep != TxStep.Ready || simulated == null || !isConnected}
      >
        {buttonLabel}
      </Button>

      <Button onClick={() => tx?.mutate()}>Stake</Button>



      {tx?.error && !!!tx.buttonLabel && (
        <Text color="red" fontSize={12}>
          {/* {' '}
          {tx?.error}{' '} */}
          {JSON.stringify(tx, null, 2)}
        </Text>
      )}
    </VStack>
  )
}

export default DepositForm
