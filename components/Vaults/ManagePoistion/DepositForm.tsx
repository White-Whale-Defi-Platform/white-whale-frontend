import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Spinner,
  Text,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import Finder from 'components/Finder'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

import useDepost from '../hooks/useDeposit'
import { TxStep } from '../hooks/useTransaction'

type Props = {
  connected: WalletStatusType
  isLoading: boolean
  balance: number | undefined
  defaultToken: string
  edgeTokenList?: string[]
  showList?: boolean
  vaultAddress: string
  refetch: () => void
}

const DepositForm = ({
  connected,
  isLoading,
  balance,
  defaultToken,
  edgeTokenList = [],
  showList = false,
  vaultAddress,
  refetch,
}: Props) => {
  const baseToken = useBaseTokenInfo()

  const [token, setToken] = useState({
    amount: 0,
    tokenSymbol: defaultToken,
  })
  const toast = useToast()
  const { chainId } = useRecoilValue(walletState)
  const isConnected = connected === `@wallet-state/connected`

  const onSuccess = useCallback(
    (txHash) => {
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
    [token]
  )

  const { tx } = useDepost({ vaultAddress, token, onSuccess })

  const buttonLabel = useMemo(() => {
    // TODO: Note for later, Select Token is commented
    if (connected !== `@wallet-state/connected`) return 'Connect Wallet'
    // else if (!token?.tokenSymbol)
    //     return 'Select token'
    else if (!!!token?.amount) return 'Enter Amount'
    else if (tx?.buttonLabel) return tx?.buttonLabel
    else return 'Deposit'
  }, [tx?.buttonLabel, connected, token])

  const onSubmit = (event) => {
    event?.preventDefault()
    tx?.submit()
  }

  useEffect(() => {
    if (tx.txStep === TxStep.Success) {
      setToken({ ...token, amount: 0 })
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
        <HStack>
          <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">
            Balance:{' '}
          </Text>
          {isLoading ? (
            <Spinner color="white" size="xs" />
          ) : (
            <Text fontSize="14" fontWeight="700">
              {balance?.toFixed(6)}
            </Text>
          )}
        </HStack>
        <AssetInput
          value={token}
          token={token}
          disabled={false}
          minMax={true}
          balance={balance}
          showList={showList}
          edgeTokenList={edgeTokenList}
          onChange={(value) => setToken(value)}
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

      {/* <VStack alignItems="flex-start" width="full" p={3}>
                <HStack justifyContent="space-between" width="full">
                    <HStack >
                        <Text color="brand.500" fontSize={12}> Fee</Text>
                        <Tooltip label="Fee paid to execute this transaction" padding="1rem" bg="blackAlpha.900" fontSize="xs" maxW="330px">
                            <Box cursor="pointer" color="brand.50">
                                <InfoOutlineIcon width=".7rem" height=".7rem" />
                            </Box>
                        </Tooltip>
                    </HStack>
                    <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} {baseToken?.symbol} </Text>
                </HStack>
            </VStack> */}

      {/* {
                (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
            } */}
    </VStack>
  )
}

export default DepositForm
