import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, VStack, useToast } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput/index'
import Finder from 'components/Finder'
import { TxStep } from 'components/Pages/Flashloan/Vaults/hooks/useTransaction'
import useWithdraw from 'components/Pages/Flashloan/Vaults/hooks/useWithdraw'
import { fromChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

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
  })
  const toast = useToast()
  const { chainId } = useRecoilValue(chainState)
  const onSuccess = useCallback((txHash) => {
    refetch?.()
    toast({
      title: 'Withdraw from Vault Success.',
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
      return tx?.buttonLabel
    }
    return 'Withdraw'
  }, [tx?.buttonLabel, isWalletConnected, token])

  const onSubmit = async (event) => {
    event?.preventDefault()
    await tx?.submit()
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
        disabled={tx.txStep !== TxStep.Ready || !isWalletConnected}
      >
        {buttonLabel}
      </Button>
    </VStack>
  )
}

export default WithdrawForm
