import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Finder from 'components/Finder'
import { bondTokens } from 'components/Pages/Bonding/BondingActions/hooks/bondTokens'
import { claimRewards } from 'components/Pages/Bonding/BondingActions/hooks/claimRewards'
import { createNewEpoch } from 'components/Pages/Bonding/BondingActions/hooks/createNewEpoch'
import { unbondTokens } from 'components/Pages/Bonding/BondingActions/hooks/unbondTokens'
import { withdrawTokens } from 'components/Pages/Bonding/BondingActions/hooks/withdrawTokens'
import { ActionType } from 'components/Pages/Bonding/BondingOverview'
import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'
import { convertDenomToMicroDenom } from 'util/conversion/index'

export const useTransaction = () => {
  const toast = useToast()
  const { chainId, network, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [bondingAction, setBondingAction] = useState<ActionType>(null)
  const [txHash, setTxHash] = useState<string>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)
  const config: Config = useConfig(network, chainId)

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

  const { mutate } = useMutation(async (data: any) => {
    const adjustedAmount = convertDenomToMicroDenom(data.amount, 6)
    if (data.bondingAction === ActionType.bond) {
      return await bondTokens(
        signingClient,
        address,
        adjustedAmount,
        data.denom,
        config,
        injectiveSigningClient,
      )
    } else if (data.bondingAction === ActionType.unbond) {
      return await unbondTokens(
        signingClient,
        address,
        adjustedAmount,
        data.denom,
        config,
        injectiveSigningClient,
      )
    } else if (data.bondingAction === ActionType.withdraw) {
      return await withdrawTokens(
        signingClient, address, data.denom, config, injectiveSigningClient,
      )
    } else if (data.bondingAction === ActionType.claim) {
      return await claimRewards(
        signingClient, address, config, injectiveSigningClient,
      )
    } else {
      return await createNewEpoch(
        signingClient, config, address, injectiveSigningClient,
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
          switch (bondingAction) {
            case ActionType.bond:
              return 'Bonding Failed.'
            case ActionType.unbond:
              return 'Unbonding Failed'
            case ActionType.withdraw:
              return 'Withdrawing Failed.'
            case ActionType.claim:
              return 'Claiming Failed.'
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
          switch (bondingAction) {
            case ActionType.bond:
              return 'Bonding Successful.'
            case ActionType.unbond:
              return 'Unbonding Successful.'
            case ActionType.withdraw:
              return 'Withdrawing Successful.'
            case ActionType.claim:
              return 'Claiming Successful.'
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
    bondingAction: ActionType,
    amount: number | null,
    denom: string | null,
  ) => {
    setBondingAction(bondingAction)

    mutate({
      fee,
      bondingAction,
      denom,
      amount,
    })
  },
  [fee, mutate])

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

export default useTransaction
