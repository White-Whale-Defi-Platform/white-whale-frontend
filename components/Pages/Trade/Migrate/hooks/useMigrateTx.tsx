import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { useChain } from '@cosmos-kit/react-lite'
import Finder from 'components/Finder'
import { deposit } from 'components/Pages/Trade/Migrate/hooks/deposit'
import { withdraw } from 'components/Pages/Trade/Migrate/hooks/withdraw'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'

export enum MigrateAction { Withdraw, Deposit }
export const useMigrateTx = () => {
  const toast = useToast()
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [migrateAction, setMigrateAction] = useState<MigrateAction>(null)
  const [txHash, setTxHash] = useState<string>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', error],
    () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      try {
        const response = 0 // Await client.simulate(senderAddress, debouncedMsgs, '')
        if (buttonLabel) {
          setButtonLabel(null)
        }
        setTxStep(TxStep.Ready)
        return response
      } catch (error) {
        if (
          (/insufficient funds/u).test(error.toString()) ||
          (/Overflow: Cannot Sub with/u).test(error.toString())
        ) {
          console.error(error.toString())
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else if ((/account sequence mismatch/u).test(error?.toString())) {
          setError('You have pending transaction')
          setButtonLabel('You have pending transaction')
          throw new Error('You have pending transaction')
        } else {
          console.error(error.toString())
          setTxStep(TxStep.Idle)
          setError(error?.message)
          throw Error(error?.message)
          /*
           * SetTxStep(TxStep.Idle)
           * setError("Failed to execute transaction.")
           * throw Error("Failed to execute transaction.")
           */
        }
      }
    },
    {
      enabled: txStep === TxStep.Idle && !error && Boolean(signingClient),
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      onSuccess: () => {
        setTxStep(TxStep.Ready)
      },
      onError: () => {
        setTxStep(TxStep.Idle)
      },
    },
  )

  const { mutate } = useMutation(async (data: { signingClient: SigningCosmWasmClient, migrateAction: MigrateAction, address: string, denom: string, amount: number }) => {
    console.log({ data })
    if (data.migrateAction === MigrateAction.Withdraw) {
      return withdraw(
        signingClient, address, data.denom, (data.amount * (10 ** 6)),
      )
    } else {
      return deposit(
        signingClient, address, data.denom, (data.amount * (10 ** 6)),
      )
    }
  },
  {
    onMutate: () => {
      setTxStep(TxStep.Posting)
    },
    onError: (e) => {
      let message: any = ''
      console.error(e?.toString())
      setTxStep(TxStep.Failed)
      if (
        (/insufficient funds/u).test(e?.toString()) ||
          (/Overflow: Cannot Sub with/u).test(e?.toString())
      ) {
        setError('Insufficient Funds')
        message = 'Insufficient Funds'
      } else if ((/Request rejected/u).test(e?.toString())) {
        setError('User Denied')
        message = 'User Denied'
      } else if ((/account sequence mismatch/u).test(e?.toString())) {
        setError('You have pending transaction')
        message = 'You have pending transaction'
      } else if ((/out of gas/u).test(e?.toString())) {
        setError('Out of gas, try increasing gas limit on wallet.')
        message = 'Out of gas, try increasing gas limit on wallet.'
      } else if ((/before the new\/latest epoch/u).test(e?.toString())) {
        setError('Epoch not yet created.')
        message = 'Please force the pending epoch on the bonding page.'
      } else if (
        (/There are unclaimed rewards available./u).test(e?.toString())
      ) {
        setError('There are unclaimed rewards available.')
        message =
            'There are unclaimed rewards available. Claim them before attempting to bond/unbond.'
      } else if (
        (/was submitted but was not yet found on the chain/u).test(e?.toString())
      ) {
        setError(e?.toString())
        message = (
          <Finder txHash={txInfo?.hash} chainId={chainId}>
            {' '}
          </Finder>
        )
      } else {
        setError('Failed to execute transaction.')
        message = 'Failed to execute transaction.'
      }

      toast({
        title: (() => {
          switch (migrateAction) {
            case MigrateAction.Withdraw:
              return 'Bonding Failed.'
            case MigrateAction.Deposit:
              return 'Unbonding Failed'
            default:
              return ''
          }
        })(),
        description: message,
        status: 'error',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    },
    onSuccess: (data: any) => {
      setTxStep(TxStep.Broadcasting)
      setTxHash(data?.transactionHash)
      toast({
        title: (() => {
          switch (migrateAction) {
            case MigrateAction.Deposit:
              return 'Deposit Successful.'
            case MigrateAction.Withdraw:
              return 'Withdrawal Successful.'
            default:
              return ''
          }
        })(),
        description: (
          <Finder txHash={data.transactionHash} chainId={chainId}>
            {' '}
          </Finder>
        ),
        status: 'success',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    },
  })

  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => {
      if (!txHash) {
        return null
      }
      return signingClient?.getTx(txHash)
    },
    {
      enabled: Boolean(txHash),
      retry: true,
    },
  )

  const reset = () => {
    setError(null)
    setTxHash(null)
    setTxStep(TxStep.Idle)
  }

  const submit = useCallback((
    migrateAction: MigrateAction,
    amount: number | null,
    denom: string | null,
  ) => {
    setMigrateAction(migrateAction)
    console.log(amount, denom)
    mutate({
      fee,
      address,
      migrateAction,
      denom,
      amount,
    })
  },
  [address, fee, mutate])

  useEffect(() => {
    if (txInfo && txHash) {
      if (txInfo?.code) {
        setTxStep(TxStep.Failed)
      } else {
        setTxStep(TxStep.Success)
      }
    }
  }, [txInfo, txHash, error])

  useEffect(() => {
    if (error) {
      setError(null)
    }

    if (txStep !== TxStep.Idle) {
      setTxStep(TxStep.Idle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // DebouncedMsgs

  return useMemo(() => ({
    fee,
    buttonLabel,
    submit,
    txStep,
    txInfo,
    txHash,
    error,
    reset,
  }),
  [txStep, txInfo, txHash, error, fee])
}

export default useMigrateTx
