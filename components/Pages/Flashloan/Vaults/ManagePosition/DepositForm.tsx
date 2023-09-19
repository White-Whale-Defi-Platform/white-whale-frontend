import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, useMediaQuery, useToast, VStack } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput/index'
import Finder from 'components/Finder'
import useDeposit from 'components/Pages/Flashloan/Vaults/hooks/useDeposit'
import { TxStep } from 'components/Pages/Flashloan/Vaults/hooks/useTransaction'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

type Props = {
  isWalletConnected: boolean
  isLoading: boolean
  balance: number | undefined
  defaultToken: string
  edgeTokenList?: string[]
  showList?: boolean
  vaultAddress: string
  refetch: () => void
}

const DepositForm = ({
  isWalletConnected,
  balance,
  defaultToken,
  edgeTokenList = [],
  showList = false,
  vaultAddress,
  refetch,
}: Props) => {
  const [token, setToken] = useState({
    amount: 0,
    tokenSymbol: defaultToken,
  })
  const toast = useToast()
  const { chainId } = useRecoilValue(chainState)
  const [isMobile] = useMediaQuery('(max-width: 640px)')

  const onSuccess = useCallback((txHash) => {
    refetch?.()
    toast({
      title: 'Deposit to Vault Success.',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [token])

  const { tx } = useDeposit({ vaultAddress,
    token,
    onSuccess })

  const buttonLabel = useMemo(() => {
    // TODO: Note for later, Select Token is commented
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (!token?.amount) {
      return 'Enter Amount'
    } else if (tx?.buttonLabel) {
      return tx?.buttonLabel
    }
    return 'Deposit'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.txStep])

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
          minMax={true}
          balance={balance}
          showList={showList}
          edgeTokenList={edgeTokenList}
          onChange={(value) => setToken(value)}
          mobile={isMobile}
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

export default DepositForm
