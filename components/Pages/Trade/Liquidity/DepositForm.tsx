import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import { BondingDaysSlider } from 'components/Pages/Trade/Liquidity/BondingDaysSlider'
import Multiplicator from 'components/Pages/Trade/Liquidity/Multiplicator'
import defaultTokens from 'components/Pages/Trade/Swap/defaultTokens.json'
import ShowError from 'components/ShowError'
import SubmitButton from 'components/SubmitButton'
import { ACTIVE_INCENTIVE_NETWORKS } from 'constants/index'
import { num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { aprHelperState } from 'state/aprHelperState'
import { chainState } from 'state/chainState'
import { TokenItemState, TxStep } from 'types/index'

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
  openView: any
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
  openView,
}: Props) => {
  const { walletChainName } = useRecoilValue(chainState)
  const [tokenSymbolA, tokenSymbolB] = poolId?.split('-') || [defaultTokens.mainnet[walletChainName][0].tokenSymbol, defaultTokens.mainnet[walletChainName][1].tokenSymbol]

  const token1 = useMemo(() => [tokenA, tokenB].find((token) => token?.tokenSymbol === tokenSymbolA),
    [tokenA, tokenB, tokenSymbolA])
  const token2 = useMemo(() => [tokenA, tokenB].find((token) => token?.tokenSymbol === tokenSymbolB),
    [tokenA, tokenB, tokenSymbolB])
  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      token1,
      token2,
    },
  })
  const incentivesEnabled = useMemo(() => ACTIVE_INCENTIVE_NETWORKS.includes(chainId),
    [chainId])
  const currentAprHelperState = useRecoilValue(aprHelperState)

  const poolAPRs = useMemo(() => currentAprHelperState.find((poolAPRs) => poolAPRs.poolId === poolId),
    [currentAprHelperState, poolId])

  const multiplicator = useMemo(() => (bondingDays === 0
    ? bondingDays
    : Math.round(100 *
              (0.997132 +
                (0.0027633 * bondingDays) +
               (0.000105042 * (bondingDays ** 2)))) / 100),
  [bondingDays])
  // Const [bondingDays, setBondingDays] = useState(0)
  const isInputDisabled = tx?.txStep === TxStep.Posting
  const amountA = getValues('token1')

  useEffect(() => {
    if (simulated) {
      if (reverse) {
        onInputChange({ ...tokenA,
          amount: num(simulated).dp(6).
            toNumber() }, 0)
        setValue('token1', {
          ...token1,
          amount: num(simulated).dp(6).
            toNumber(),
        })
      } else {
        onInputChange({ ...token2,
          amount: num(simulated).dp(6).
            toNumber() }, 1)
        setValue('token2', {
          ...token1,
          amount: num(simulated).dp(6).
            toNumber(),
        })
      }
    } else {
      if (reverse) {
        if (!token2.amount) {
          setValue('token1', { ...token1,
            amount: null })
        }
      } else {
        if (!token1.amount) {
          setValue('token2', { ...token2,
            amount: null })
        }
      }
    }

    return () => {
      onInputChange({ ...token1,
        amount: 0 }, 0)
      tx?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated, reverse])

  useEffect(() => {
    if (tx?.txStep === TxStep.Success) {
      setValue('token1', { ...token1,
        amount: 0 })
      setValue('token2', { ...token2,
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
  }, [tx?.buttonLabel, tokenB?.tokenSymbol, isWalletConnected, amountA])

  const apr = useMemo(() => `${(((poolAPRs?.fees || 0)) + ((poolAPRs?.incentives || 0) * multiplicator)).toFixed(2)}`,
    [poolAPRs, multiplicator])

  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={isWalletConnected ? handleSubmit(tx?.submit) : handleSubmit(openView)}
    >
      <Input
        name="token1"
        control={control}
        token={token1}
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
        token={token2}
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
          (tx.txStep !== TxStep.Ready || !simulated) && isWalletConnected
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
