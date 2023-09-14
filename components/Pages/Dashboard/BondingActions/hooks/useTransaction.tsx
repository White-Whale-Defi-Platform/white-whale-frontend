import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Finder from 'components/Finder'
import { bondTokens } from 'components/Pages/Dashboard/BondingActions/hooks/bondTokens'
import { claimRewards } from 'components/Pages/Dashboard/BondingActions/hooks/claimRewards'
import { createNewEpoch } from 'components/Pages/Dashboard/BondingActions/hooks/createNewEpoch'
import { unbondTokens } from 'components/Pages/Dashboard/BondingActions/hooks/unbondTokens'
import { withdrawTokens } from 'components/Pages/Dashboard/BondingActions/hooks/withdrawTokens'
import { ActionType } from 'components/Pages/Dashboard/BondingOverview'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { convertDenomToMicroDenom } from 'util/conversion/index'

export enum TxStep {
  /**
   * Idle
   */
  Idle = 0,
  /**
   * Estimating fees
   */
  Estimating = 1,
  /**
   * Ready to post transaction
   */
  Ready = 2,
  /**
   * Signing transaction in Terra Station
   */
  Posting = 3,
  /**
   * Broadcasting
   */
  Broadcasting = 4,
  /**
   * Successful
   */
  Successful = 5,
  /**
   * Failed
   */
  Failed = 6,
}
export const useTransaction = () => {
  const toast = useToast()
  const { chainId, network, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [bondingAction, setBondingAction] = useState<ActionType>(null)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
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
          (/insufficient funds/i).test(error.toString()) ||
          (/Overflow: Cannot Sub with/i).test(error.toString())
        ) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else if ((/account sequence mismatch/i).test(error?.toString())) {
          setError('You have pending transaction')
          setButtonLabel('You have pending transaction')
          throw new Error('You have pending transaction')
        } else {
          console.error({ error })
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
      enabled: txStep === TxStep.Idle && error === null && Boolean(signingClient),
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

  const { mutate } = useMutation((data: any) => {
    const adjustedAmount = convertDenomToMicroDenom(data.amount, 6)
    if (data.bondingAction === ActionType.bond) {
      return bondTokens(
        signingClient,
        address,
        adjustedAmount,
        data.denom,
        config,
      )
    } else if (data.bondingAction === ActionType.unbond) {
      return unbondTokens(
        signingClient,
        address,
        adjustedAmount,
        data.denom,
        config,
      )
    } else if (data.bondingAction === ActionType.withdraw) {
      return withdrawTokens(
        signingClient, address, data.denom, config,
      )
    } else if (data.bondingAction === ActionType.claim) {
      return claimRewards(
        signingClient, address, config,
      )
    } else {
      return createNewEpoch(
        signingClient, config, address,
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
        (/insufficient funds/i).test(e?.toString()) ||
          (/Overflow: Cannot Sub with/i).test(e?.toString())
      ) {
        setError('Insufficient Funds')
        message = 'Insufficient Funds'
      } else if ((/Request rejected/i).test(e?.toString())) {
        setError('User Denied')
        message = 'User Denied'
      } else if ((/account sequence mismatch/i).test(e?.toString())) {
        setError('You have pending transaction')
        message = 'You have pending transaction'
      } else if ((/out of gas/i).test(e?.toString())) {
        setError('Out of gas, try increasing gas limit on wallet.')
        message = 'Out of gas, try increasing gas limit on wallet.'
      } else if (
        (/There are unclaimed rewards available./i).test(e?.toString())
      ) {
        setError('There are unclaimed rewards available.')
        message =
            'There are unclaimed rewards available. Claim them before attempting to bond/unbond.'
      } else if (
        (/was submitted but was not yet found on the chain/i).test(e?.toString())
      ) {
        setError(e?.toString())
        message = (
          <Finder txHash={txInfo?.txhash} chainId={chainId}>
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
      if (txHash === null) {
        return null
      }
      return signingClient.getTx(txHash)
    },
    {
      enabled: txHash !== null,
      retry: true,
    },
  )

  const reset = () => {
    setError(null)
    setTxHash(undefined)
    setTxStep(TxStep.Idle)
  }

  const submit = useCallback((
    bondingAction: ActionType,
    amount: number | null,
    denom: string | null,
  ) => {
    if (fee === null) {
      return
    }
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
    if (txInfo !== null && txHash !== null) {
      if (txInfo?.code) {
        setTxStep(TxStep.Failed)
      } else {
        setTxStep(TxStep.Successful)
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
  [txStep, txInfo, txHash, error, reset, fee])
}

export default useTransaction
