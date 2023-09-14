import { FC, Fragment, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import AssetInput from 'components/AssetInput/index'
import DoubleArrowsIcon from 'components/icons/DoubleArrowsIcon'
import { Simulated } from 'components/Pages/Trade/Swap/hooks/useSimulate'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount, num } from 'libs/num'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { TokenItemState } from 'types/index'

type Props = {
  isWalletConnected: boolean
  tokenA: TokenItemState
  tokenB: TokenItemState
  onInputChange: (asset: TokenItemState, index: number) => void
  simulated: Simulated
  isReverse: boolean
  tx: any
  state: any
  minReceive: string
  onReverseDirection: () => void
  setReverse: (values: boolean) => void
  resetForm: boolean
  setResetForm: (value: boolean) => void
  path: string[]
}

const SwapForm: FC<Props> = ({
  isWalletConnected,
  tokenA,
  tokenB,
  onInputChange,
  onReverseDirection,
  simulated,
  tx,
  state,
  minReceive,
  isReverse,
  setReverse,
  resetForm,
  setResetForm,
  path,
}) => {
  const { data: poolList } = usePoolsListQuery()

  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      tokenA,
      tokenB,
    },
  })

  useEffect(() => {
    if (resetForm || tx?.txStep === TxStep.Success) {
      setValue('tokenA', { ...tokenA,
        amount: 0 })
      setValue('tokenB', { ...tokenB,
        amount: 0 })
      setResetForm(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetForm, tx?.txStep])

  const { balance: tokenABalance } = useTokenBalance(tokenA?.tokenSymbol)
  const { balance: tokenBBalance } = useTokenBalance(tokenB?.tokenSymbol)

  const tokenAInfo = useTokenInfo(tokenA?.tokenSymbol)
  const tokenBInfo = useTokenInfo(tokenB?.tokenSymbol)

  const amountA = getValues('tokenA')
  const amountB = getValues('tokenB')
  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (!tokenA?.tokenSymbol || !tokenB?.tokenSymbol) {
      return 'Select Token'
    } else if (state?.error) {
      return state?.error
    } else if (!amountA?.amount) {
      return 'Enter Amount'
    } else if (tx?.buttonLabel) {
      return tx?.buttonLabel
    }
    return 'Swap'

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tx?.buttonLabel,
    tokenB.tokenSymbol,
    isWalletConnected,
    amountA,
    state?.error,
  ])

  const [isMobile] = useMediaQuery('(max-width: 485px)')
  const [isLabelOpen, setIsLabelOpen] = useState(false)

  const explainer = (input: string) => (
    <Tooltip
      label={input}
      padding="1rem"
      bg="blackAlpha.900"
      fontSize="xs"
      maxW="330px"
      isOpen={isLabelOpen}
    >
      <Box
        cursor="pointer"
        color="brand.50"
        display="flex"
        alignItems="center"
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}
      >
        <InfoOutlineIcon width=".7rem" height=".7rem" />
      </Box>
    </Tooltip>
  )
  const onReverse = () => {
    const A = {
      ...tokenB,
      amount:
        tokenA.amount ||
        parseFloat(fromChainAmount(simulated?.amount, tokenAInfo?.decimals)),
      decimals: poolList.pools.
        map(({ pool_assets }) => pool_assets).
        map(([a, b]) => (a?.symbol === (tokenA.tokenSymbol as string)
          ? a?.decimals
          : b?.decimals))[0],
    }
    const B = {
      ...tokenA,
      amount:
        tokenB.amount ||
        parseFloat(fromChainAmount(simulated?.amount, tokenBInfo?.decimals)),
      decimals: poolList.pools.
        map(({ pool_assets }) => pool_assets).
        map(([a, b]) => (a?.symbol === (tokenB.tokenSymbol as string)
          ? a?.decimals
          : b?.decimals))[0],
    }
    setValue(
      'tokenA', A, { shouldValidate: true },
    )
    setValue(
      'tokenB', B, { shouldValidate: true },
    )

    onReverseDirection()
  }

  const rate = useMemo(() => {
    if (!simulated) {
      return null
    }

    const e = num(tokenA.amount).times(10 ** tokenBInfo.decimals)
    return num(simulated?.amount).div(e).
      toFixed(6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated, tokenA.amount])

  useEffect(() => {
    if (simulated) {
      if (isReverse) {
        const asset = { ...tokenA }
        asset.amount = parseFloat(fromChainAmount(simulated?.amount, tokenAInfo?.decimals))
        setValue('tokenA', asset)
        onInputChange({
          ...tokenA,
          amount: parseFloat(fromChainAmount(simulated?.amount, tokenAInfo?.decimals)),
        },
        0)
      } else {
        const asset = { ...tokenB }
        asset.amount = parseFloat(fromChainAmount(simulated?.amount, tokenBInfo?.decimals))
        setValue('tokenB', asset)
        onInputChange({
          ...tokenB,
          amount: parseFloat(fromChainAmount(simulated?.amount, tokenBInfo?.decimals)),
        },
        1)
      }
    } else {
      if (isReverse) {
        const asset = { ...tokenB }
        if (!asset?.amount) {
          asset.amount = 0
          setValue(
            'tokenA', asset, { shouldValidate: true },
          )
        }
      } else {
        const asset = { ...tokenA }
        if (!asset?.amount || state?.error) {
          asset.amount = 0
          setValue(
            'tokenB', asset, { shouldValidate: true },
          )
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated])

  const isInputDisabled = tx?.txStep === TxStep.Posting

  return (
    <VStack
      paddingX={{ base: 6,
        md: 10 }}
      paddingY={{ base: 14,
        md: 10 }}
      width="full"
      background={'#1C1C1C'}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      alignItems="flex-start"
      minH={400}
      maxWidth={{ base: 'full',
        md: 650 }}
      gap={4}
      as="form"
      onSubmit={handleSubmit(tx?.submit)}
      overflow="hidden"
      position="relative"
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={2}>
        <Controller
          name="tokenA"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              hideToken={tokenA?.tokenSymbol}
              {...field}
              token={tokenA}
              balance={tokenABalance}
              minMax={false}
              mobile={isMobile}
              disabled={isInputDisabled}
              onChange={(value, isTokenChange) => {
                setReverse(false)
                onInputChange(value, 0)
                field.onChange(value)
              }}
            />
          )}
        />
      </VStack>
      <HStack width="full" justifyContent="center">
        <IconButton
          aria-label="Reverse"
          variant="ghost"
          color="brand.500"
          _focus={{ boxShadow: 'none' }}
          _active={{ background: 'transparent' }}
          _hover={{ background: 'transparent',
            color: 'brand.300' }}
          icon={<DoubleArrowsIcon width="2rem" height="2rem" />}
          disabled={isInputDisabled}
          onClick={onReverse}
        />
      </HStack>
      <VStack
        width="full"
        alignItems="flex-start"
        paddingBottom={8}
        style={{ margin: 'unset' }}
      >

        <Controller
          name="tokenB"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              hideToken={tokenA?.tokenSymbol}
              {...field}
              token={tokenB}
              hideMax={true}
              minMax={false}
              balance={tokenBBalance}
              disabled={isInputDisabled}
              showBalanceSlider={false}
              mobile={isMobile}
              onChange={(value, isTokenChange) => {
                if (tokenB?.tokenSymbol && !isTokenChange) {
                  setReverse(true)
                }
                if (isTokenChange && isReverse) {
                  setReverse(false)
                }
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
          tx?.txStep === TxStep.Estimating ||
          tx?.txStep === TxStep.Posting ||
          tx?.txStep === TxStep.Broadcasting ||
          state?.isLoading
        }
        disabled={
          tx?.txStep !== TxStep.Ready || simulated === null || !isWalletConnected
        }
      >
        {buttonLabel}
      </Button>
      <VStack alignItems="flex-start" width="full" px={3}>
        {amountB.amount && (
          <>
            <HStack justifyContent="space-between" width="full">
              <HStack style={{ marginTop: 'unset' }} height="24px">
                <Text color="brand.500" fontSize={12}>
                  Rate
                </Text>
                {explainer('Swap price is calculated based on the pool price and spread')}
              </HStack>
              <Text color="brand.500" fontSize={12}>
                {rate} {tokenB?.tokenSymbol} per {tokenA?.tokenSymbol}
                {/* {rate} {tokenA?.tokenSymbol} per {tokenB?.tokenSymbol} */}
              </Text>
            </HStack>

            {minReceive && (
              <HStack
                justifyContent="space-between"
                width="full"
                style={{ marginTop: 'unset' }}
                height="24px"
              >
                <HStack>
                  <Text color="brand.500" fontSize={12}>
                    Min Receive
                  </Text>
                  {explainer('Expected minimum quantity to be received based on the current price, maximum spread, and trading fee')}
                </HStack>
                <Text color="brand.500" fontSize={12}>
                  {num(minReceive).toFixed(tokenBInfo?.decimals)}
                </Text>
              </HStack>
            )}
          </>
        )}

        {Boolean(path?.length) && (
          <HStack
            justifyContent="space-between"
            width="full"
            style={{ marginTop: 'unset' }}
          >
            <HStack height="24px">
              <Text color="brand.500" fontSize={12}>
                Route
              </Text>
              {explainer('Optimized route for your optimal gain')}
            </HStack>
            <HStack maxW="70%" flexWrap="wrap">
              {path?.map((item, index) => (
                <Fragment key={item}>
                  <Text color="brand.500" fontSize={12}>
                    {' '}
                    {item}
                  </Text>
                  {index < path.length - 1 && <Text fontSize={12}> → </Text>}
                </Fragment>
              ))}
            </HStack>
          </HStack>
        )}
      </VStack>
    </VStack>
  )
}

export default SwapForm
