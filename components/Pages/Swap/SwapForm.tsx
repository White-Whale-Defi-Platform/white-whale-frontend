import { FC, Fragment, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Hide,
  HStack,
  IconButton,
  Show,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import DoubleArrowsIcon from 'components/icons/DoubleArrowsIcon'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useBaseTokenInfo, useTokenInfo } from 'hooks/useTokenInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount } from 'libs/num'
import { num } from 'libs/num'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'

import { WalletStatusType } from '../../../state/atoms/walletAtoms'
import { Simulated } from './hooks/useSimulate'
import { TokenItemState } from './swapAtoms'

type Props = {
  connected: WalletStatusType
  tokenA: TokenItemState
  tokenB: TokenItemState
  onInputChange: (asset: TokenItemState, index: number) => void
  simulated: Simulated
  isReverse: boolean
  tx: any
  state: any
  minReceive: string
  onReverseDirection: () => void
  setReverse: (valuse: boolean) => void
  resetForm: boolean
  setResetForm: (value: boolean) => void
  path: string[]
}

const SwapForm: FC<Props> = ({
  connected,
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
  const baseToken = useBaseTokenInfo()
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
      setValue('tokenA', { ...tokenA, amount: 0 })
      setValue('tokenB', { ...tokenB, amount: 0 })
      setResetForm(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetForm, tx?.txStep])

  // const [[_, tokenBBalance] = [], isLoading] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])

  const { balance: tokenABalance, isLoading: tokanAloading } = useTokenBalance(
    tokenA?.tokenSymbol
  )
  const { balance: tokenBBalance, isLoading: tokanBloading } = useTokenBalance(
    tokenB?.tokenSymbol
  )

  const tokenAInfo = useTokenInfo(tokenA?.tokenSymbol)
  const tokenBInfo = useTokenInfo(tokenB?.tokenSymbol)
  const isConnected = connected === `@wallet-state/connected`

  const amountA = getValues('tokenA')
  const amountB = getValues('tokenB')

  const buttonLabel = useMemo(() => {
    if (connected !== `@wallet-state/connected`) return 'Connect Wallet'
    else if (!tokenA?.tokenSymbol || !tokenB?.tokenSymbol) return 'Select Token'
    else if (state?.error) return state?.error
    else if (!!!amountA?.amount) return 'Enter Amount'
    else if (tx?.buttonLabel) return tx?.buttonLabel
    else return 'Swap'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, amountA, state?.error])

  const onReverse = () => {
    // setValue("tokenA", tokenB?.amount === 0 ? {...tokenB, amount : parseFloat(fromChainAmount(simulated?.amount))} : tokenB, { shouldValidate: true })
    // setValue("tokenB", tokenA, { shouldValidate: true })

    const A = {
      ...tokenB,
      amount:
        tokenA.amount ||
        parseFloat(fromChainAmount(simulated?.amount, tokenAInfo?.decimals)),
      decimals: poolList.pools
        .map(({ pool_assets }) => pool_assets)
        .map(([a, b]) =>
          a?.symbol == (tokenA.tokenSymbol as string)
            ? a?.decimals
            : b?.decimals
        )[0],
    }
    const B = {
      ...tokenA,
      amount:
        tokenB.amount ||
        parseFloat(fromChainAmount(simulated?.amount, tokenBInfo?.decimals)),
      decimals: poolList.pools
        .map(({ pool_assets }) => pool_assets)
        .map(([a, b]) =>
          a?.symbol == (tokenB.tokenSymbol as string)
            ? a?.decimals
            : b?.decimals
        )[0],
    }
    setValue('tokenA', A, { shouldValidate: true })
    setValue('tokenB', B, { shouldValidate: true })

    onReverseDirection()
  }

  const rate = useMemo(() => {
    if (!simulated) return null

    const e = num(tokenA.amount).times(Math.pow(10, tokenBInfo.decimals))
    return num(simulated?.amount).div(e).toFixed(6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated, tokenA.amount])

  useEffect(() => {
    if (simulated) {
      if (isReverse) {
        const asset = { ...tokenA }
        asset.amount = parseFloat(
          fromChainAmount(simulated?.amount, tokenAInfo?.decimals)
        )
        setValue('tokenA', asset)
        onInputChange(
          {
            ...tokenA,
            amount: parseFloat(
              fromChainAmount(simulated?.amount, tokenAInfo?.decimals)
            ),
          },
          0
        )
      } else {
        const asset = { ...tokenB }
        asset.amount = parseFloat(
          fromChainAmount(simulated?.amount, tokenBInfo?.decimals)
        )
        setValue('tokenB', asset)
        onInputChange(
          {
            ...tokenB,
            amount: parseFloat(
              fromChainAmount(simulated?.amount, tokenBInfo?.decimals)
            ),
          },
          1
        )
      }
    } else {
      if (isReverse) {
        const asset = { ...tokenB }
        if (!!!asset?.amount) {
          asset.amount = 0
          setValue('tokenA', asset, { shouldValidate: true })
        }
      } else {
        const asset = { ...tokenA }
        if (!!!asset?.amount || state?.error) {
          asset.amount = 0
          setValue('tokenB', asset, { shouldValidate: true })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated])

  const isInputDisabled = tx?.txStep == TxStep.Posting

  return (
    <VStack
      paddingX={{ base: 6, md: 10 }}
      paddingY={{ base: 14, md: 10 }}
      width="full"
      background="#1C1C1C"
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      alignItems="flex-start"
      minH={400}
      maxWidth={{ base: 'full', md: 600 }}
      gap={4}
      as="form"
      onSubmit={handleSubmit(tx?.submit)}
      overflow="hidden"
      position="relative"
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={2}>
        <HStack justifyContent="space-between" width="full">
          <HStack>
            <Text
              marginLeft={4}
              color="brand.50"
              fontSize="14"
              fontWeight="500"
            >
              Balance:{' '}
            </Text>
            {tokanAloading ? (
              <Spinner color="white" size="xs" />
            ) : (
              <Text fontSize="14" fontWeight="700">
                {tokenABalance?.toFixed(6)}
              </Text>
            )}
          </HStack>

          <HStack visibility={{ base: 'visible', md: 'hidden' }}>
            <Button
              variant="outline"
              size="xs"
              maxW="fit-content"
              onClick={() => {
                setReverse(false)
                onInputChange({ ...tokenA, amount: tokenABalance / 2 }, 0)
                setValue(
                  'tokenA',
                  { ...tokenA, amount: tokenABalance / 2 },
                  { shouldValidate: true }
                )
              }}
            >
              half
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setReverse(false)
                onInputChange({ ...tokenA, amount: tokenABalance }, 0)
                setValue(
                  'tokenA',
                  { ...tokenA, amount: tokenABalance },
                  { shouldValidate: true }
                )
              }}
            >
              max
            </Button>
          </HStack>
        </HStack>
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
              // onInputFocus={() => setIsReverse(true)}
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
          _hover={{ background: 'transparent', color: 'brand.300' }}
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
        <HStack justifyContent="space-between" width="full">
          <HStack>
            <Text
              marginLeft={4}
              color="brand.50"
              fontSize="14"
              fontWeight="500"
            >
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
          <HStack>
            <Hide above="md">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setReverse(true)
                  onInputChange({ ...tokenB, amount: tokenBBalance / 2 }, 1)
                  setValue(
                    'tokenB',
                    { ...tokenB, amount: tokenBBalance / 2 },
                    { shouldValidate: true }
                  )
                }}
              >
                half
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setReverse(true)
                  onInputChange({ ...tokenB, amount: tokenBBalance / 2 }, 1)
                  setValue(
                    'tokenB',
                    { ...tokenB, amount: tokenBBalance },
                    { shouldValidate: true }
                  )
                }}
              >
                max
              </Button>
            </Hide>
          </HStack>
        </HStack>
        <Controller
          name="tokenB"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AssetInput
              hideToken={tokenA?.tokenSymbol}
              {...field}
              token={tokenB}
              minMax={false}
              balance={tokenBBalance}
              disabled={isInputDisabled}
              // onInputFocus={() => setIsReverse(true)}
              onChange={(value, isTokenChange) => {
                if (tokenB?.tokenSymbol && !isTokenChange) setReverse(true)
                if (isTokenChange && isReverse) setReverse(false)
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
          tx?.txStep == TxStep.Broadcasting ||
          state?.isLoading
        }
        disabled={tx?.txStep != TxStep.Ready || simulated == null || !isConnected}
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
                <Tooltip
                  label="Swap price is calculated based on the pool price and spread"
                  padding="1rem"
                  bg="blackAlpha.900"
                  fontSize="xs"
                  maxW="330px"
                >
                  <Box
                    cursor="pointer"
                    color="brand.50"
                    display="flex"
                    alignItems="center"
                  >
                    <InfoOutlineIcon width=".7rem" height=".7rem" />
                  </Box>
                </Tooltip>
              </HStack>
              <Text color="brand.500" fontSize={12}>
                {rate} {tokenB?.tokenSymbol} per {tokenA?.tokenSymbol}
                {/* {rate} {tokenA?.tokenSymbol} per {tokenB?.tokenSymbol} */}
              </Text>
            </HStack>

            {/* <HStack justifyContent="space-between" width="full" style={{ marginTop: 'unset' }}>
                        <HStack >
                            <Text color="brand.500" fontSize={12}> Fee</Text>
                            <Tooltip label="Fee paid to execute this transaction" padding="1rem" bg="blackAlpha.900" fontSize="xs" maxW="330px">
                                <Box cursor="pointer" color="brand.50">
                                    <InfoOutlineIcon width=".7rem" height=".7rem" />
                                </Box>
                            </Tooltip>
                        </HStack>
                        <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} {baseToken?.symbol} </Text>
                    </HStack> */}

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
                  <Tooltip
                    label="Expected minimum quantity to be received based on the current price, maximum spread, and trading fee"
                    padding="1rem"
                    bg="blackAlpha.900"
                    fontSize="xs"
                    maxW="330px"
                  >
                    <Box
                      cursor="pointer"
                      color="brand.50"
                      display="flex"
                      alignItems="center"
                    >
                      <InfoOutlineIcon width=".7rem" height=".7rem" />
                    </Box>
                  </Tooltip>
                </HStack>
                <Text color="brand.500" fontSize={12}>
                  {num(minReceive).toFixed(tokenBInfo?.decimals)}
                </Text>
              </HStack>
            )}
          </>
        )}

        {!!path?.length && (
          <HStack
            justifyContent="space-between"
            width="full"
            style={{ marginTop: 'unset' }}
          >
            <HStack height="24px">
              <Text color="brand.500" fontSize={12}>
                Route
              </Text>
              <Tooltip
                label="Optimized route for your optimal gain"
                padding="1rem"
                bg="blackAlpha.900"
                fontSize="xs"
                maxW="330px"
              >
                <Box
                  cursor="pointer"
                  color="brand.50"
                  marginTop="-1px"
                  display="flex"
                  alignItems="center"
                >
                  <InfoOutlineIcon width=".7rem" />
                </Box>
              </Tooltip>
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
      {/* {
                (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
            } */}
    </VStack>
  )
}

export default SwapForm
