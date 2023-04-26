import { useEffect, useMemo, useState } from 'react'

import { Button, Text, VStack } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount } from 'libs/num'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'

import { WalletStatusType } from 'state/atoms/walletAtoms'
import useWithdraw from './hooks/useWithdraw'
import { TokenItemState } from './lpAtoms'

type Props = {
  poolId: string
  tokenA: TokenItemState
  connected: WalletStatusType
}

const WithdrawForm = ({ poolId, tokenA, connected }: Props) => {
  const [
    {
      swap_address: swapAddress = null,
      lp_token: contract = null,
      liquidity = {},
    } = {},
  ] = useQueryPoolLiquidity({ poolId })

  const [token, setToken] = useState<TokenItemState>(tokenA)
  const tx = useWithdraw({ token, contract, swapAddress, poolId })
  const baseToken = useBaseTokenInfo()
  const isConnected = connected === `@wallet-state/connected`

  useEffect(() => {
    if (tx.txStep === TxStep.Success)
      setToken({
        ...token,
        amount: 0,
      })
  }, [tx?.txStep])

  const isInputDisabled = tx?.txStep == TxStep.Posting

  const tokenBalance = useMemo(() => {
    const { tokenAmount = 0 } = (liquidity as any)?.providedTotal || {}
    return fromChainAmount(tokenAmount)
  }, [liquidity])

  const buttonLabel = useMemo(() => {
    if (connected !== WalletStatusType.connected) return 'Connect Wallet'
    else if (!!!token?.amount) return 'Enter Amount'
    else if (tx?.buttonLabel) return tx?.buttonLabel
    else return 'Withdraw'
  }, [tx?.buttonLabel, connected, token?.amount])

  const onInputChange = (value) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
      tx.reset()

    console.log({ value })

    setToken(value)
  }

  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={(event) => {
        event.preventDefault()
        tx?.submit()
      }}
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <AssetInput
          isSingleInput={true}
          disabled={isInputDisabled}
          value={token}
          balance={Number(tokenBalance)}
          image={false}
          token={tokenA}
          showList={false}
          hideDollarValue={true}
          onChange={onInputChange}
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
