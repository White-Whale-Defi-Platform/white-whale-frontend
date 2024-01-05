import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, VStack, useToast } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput/index'
import Finder from 'components/Finder'
import useWithdraw from 'components/Pages/Flashloan/Vaults/hooks/useWithdraw'
import { fromChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'

type Props = {
  isWalletConnected: boolean
  isLoading: boolean
  balance: number | undefined
  defaultToken: string
  vaultAddress: string
  lpToken: string
  assetBalance: string
  refetch: () => void
}

const WithdrawForm = ({
  isWalletConnected,
  balance,
  defaultToken,
  vaultAddress,
  lpToken,
  refetch,
}: Props) => {
  const [token, setToken] = useState({
    amount: 0,
    tokenSymbol: defaultToken,
    decimals: 0,
  })
  const toast = useToast()
  const { chainId } = useRecoilValue(chainState)
  const onSuccess = useCallback((txHash) => {
    refetch?.()
    toast({
      title: 'Successful Withdrawal.',
      description: (
        <Finder txHash={txHash} chainId={chainId}>
          {' '}
        </Finder>
      ),
      status: 'success',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })
  },
  [refetch, chainId, toast])

  const { tx } = useWithdraw({ vaultAddress,
    lpToken,
    token,
    onSuccess })

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (!token?.amount) {
      return 'Enter Amount'
    } else if (tx?.buttonLabel) {
      return tx?.buttonLabel as string
    }
    return 'Withdraw'
  }, [tx?.buttonLabel, isWalletConnected, token])

  const onSubmit = (event) => {
    event?.preventDefault()
    tx?.submit()
  }

  useEffect(() => {
    if (tx.txStep === TxStep.Success) {
      setToken({ ...token,
        amount: 0 })
      tx?.reset()
    }
  }, [tx, token, setToken])
  return (
    <VStack
      paddingY={6}
      paddingX={2}
      width="full"
      as="form"
      onSubmit={onSubmit}
    >
      <VStack width="full" alignItems="flex-start" paddingBottom={8}>
        <AssetInput
          value={token}
          hideDollarValue={true}
          token={token}
          disabled={false}
          ignoreSlack={true}
          balance={Number(fromChainAmount(balance))}
          showList={false}
          onChange={(value) => setToken(value)}
        />
      </VStack>

      <Button
        type="submit"
        width="full"
        variant="primary"
        isLoading={
          tx?.txStep === TxStep.Estimating ||
          tx?.txStep === TxStep.Posting ||
          tx?.txStep === TxStep.Broadcasting
        }
        disabled={tx.txStep === TxStep.Estimating ||
          tx.txStep === TxStep.Posting ||
          tx.txStep === TxStep.Broadcasting }
      >
        {buttonLabel}
      </Button>
    </VStack>
  )
}

export default WithdrawForm
