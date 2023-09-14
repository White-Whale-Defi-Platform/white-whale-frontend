import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import { BondingDaysSlider } from 'components/Pages/Trade/Liquidity/BondingDaysSlider'
import ShowError from 'components/ShowError'
import SubmitButton from 'components/SubmitButton'
import { ACTIVE_INCENTIVE_NETWORKS } from 'constants/index'
import { TxStep } from 'hooks/useTransaction'
import { num } from 'libs/num'
import { useRecoilState } from 'recoil'
import { aprHelperState } from 'state/aprHelperState'
import { TokenItemState } from 'types/index'

import Multiplicator from 'components/Pages/Trade/Liquidity/Multiplicator'

type Props = {
  isWalletConnected: boolean
  tokenA: TokenItemState
  tokenB: TokenItemState
  tx: any
  simulated: string | null
  onInputChange: (asset: TokenItemState, index: number) => void
  setReverse: (value: boolean) => void
  reverse: boolean
  setBondingDays: (value: number) => void
  bondingDays: number
  clearForm: () => void
  chainId: string
  mobile?: boolean
  poolId: string
}

const DepositForm = ({
  tokenA,
  tokenB,
  onInputChange,
  isWalletConnected,
  tx,
  simulated,
  setReverse,
  reverse,
  bondingDays,
  setBondingDays,
  clearForm,
  chainId,
  mobile,
  poolId,
}: Props) => {
  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1: tokenA,
      token2: tokenB,
    },
  })

  const incentivesEnabled = useMemo(() => ACTIVE_INCENTIVE_NETWORKS.includes(chainId),
    [chainId])
  const [currentAprHelperState, _] = useRecoilState(aprHelperState)

  const poolAPRs = useMemo(() => currentAprHelperState.find((poolAPRs) => poolAPRs.poolId === poolId),
    [currentAprHelperState, poolId])

  const multiplicator = useMemo(() => (bondingDays == 0
    ? bondingDays
    : Math.round(100 *
              (0.997132 +
                0.0027633 * bondingDays +
                0.000105042 * bondingDays ** 2)) / 100),
  [bondingDays])
  // Const [bondingDays, setBondingDays] = useState(0)
  const isInputDisabled = tx?.txStep == TxStep.Posting
  const amountA = getValues('token1')

  useEffect(() => {
    if (simulated) {
      if (reverse) {
        onInputChange({ ...tokenA,
          amount: num(simulated).dp(6).
            toNumber() }, 0)
        setValue('token1', {
          ...tokenA,
          amount: num(simulated).dp(6).
            toNumber(),
        })
      } else {
        onInputChange({ ...tokenB,
          amount: num(simulated).dp(6).
            toNumber() }, 1)
        setValue('token2', {
          ...tokenA,
          amount: num(simulated).dp(6).
            toNumber(),
        })
      }
    } else {
      if (reverse) {
        if (!tokenB.amount) {
          setValue('token1', { ...tokenA,
            amount: undefined })
        }
      } else {
        if (!tokenA.amount) {
          setValue('token2', { ...tokenB,
            amount: undefined })
        }
      }
    }

    return () => {
      onInputChange({ ...tokenA,
        amount: 0 }, 0)
      tx?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated, reverse])

  useEffect(() => {
    if (tx?.txStep === TxStep.Success) {
      setValue('token1', { ...tokenA,
        amount: 0 })
      setValue('token2', { ...tokenB,
        amount: 0 })
      clearForm()
      // Tx?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.txStep])

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (!tokenB?.tokenSymbol) {
      return 'Select Token'
    } else if (!amountA?.amount) {
      return 'Enter Amount'
    } else if (tx?.buttonLabel) {
      return tx?.buttonLabel
    }
    return 'Deposit'
  }, [tx?.buttonLabel, tokenB.tokenSymbol, isWalletConnected, amountA])
  
  const apr = useMemo(() => `${(poolAPRs?.fees * 100 + poolAPRs?.incentives * multiplicator).toFixed(2)}`,
    [poolAPRs, multiplicator])

  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={handleSubmit(tx?.submit)}
    >
      <Input
        name="token1"
        control={control}
        token={tokenA}
        mobile={mobile}
        isDisabled={isInputDisabled}
        onChange={(value) => {
          setReverse(false)
          onInputChange(value, 0)
        }}
      />

      <Input
        name="token2"
        control={control}
        token={tokenB}
        isDisabled={isInputDisabled || !tokenB?.tokenSymbol}
        mobile={mobile}
        onChange={(value) => {
          setReverse(true)
          onInputChange(value, 1)
        }}
      />

      <BondingDaysSlider
        bondingDays={bondingDays}
        setBondingDays={setBondingDays}
        show={incentivesEnabled}
      />

      <Multiplicator
        multiplicator={String(multiplicator)}
        apr={apr}
        show={incentivesEnabled}
        incentivized={poolAPRs?.incentives !== 0}
      />

      <SubmitButton
        label={buttonLabel}
        isConnected={isWalletConnected}
        txStep={tx?.txStep}
        isDisabled={
          tx.txStep != TxStep.Ready || simulated == null || !isWalletConnected
        }
      />

      <ShowError
        show={tx?.error && Boolean(!tx.buttonLabel)}
        message={tx?.error}
      />
    </VStack>
  )
}

export default DepositForm
