import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { fromUtf8 } from '@cosmjs/encoding'
import { coin } from '@cosmjs/stargate'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'

// import { TokenInfo } from '../../queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'
import { Wallet } from 'util/wallet-adapters'
import { toChainAmount } from '../../../../libs/num'
import { usePoolFromListQueryById, usePoolsListQuery } from '../../../../queries/usePoolsListQuery'
import { walletState } from '../../../../state/atoms/walletAtoms'
import useTx from './useTx'

type OpenPosition = {
  // amount: number
  poolId: string
}

export const useClosePosition = ({
  // amount,
  poolId
}: OpenPosition) => {

  const { address, client } = useRecoilValue(walletState)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTx({ transcationType: 'Close positiion', client })

  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
  // increaseAllowanceMessages.push(
  //   createIncreaseAllowanceMessage({
  //     tokenAmount: 100,
  //     tokenAddress: pool?.lp_token,
  //     senderAddress: address,
  //     swapAddress: pool?.staking_address,
  //   })
  // )

  // client.getBalance(address, pool?.lp_token).then(console.log) 

  // client?.queryContractSmart(pool?.lp_token, {
  //   balance: { address },
  // }).then(console.log)

  // const executeAddLiquidityMessage = createExecuteMessage({
  //   message: {
  //     close_position: {
  //       unbonding_duration: 64
  //     },
  //   },
  //   senderAddress: address,
  //   contractAddress: pool?.staking_address,
  //   funds: [],
  // })

  // const msgs = [
  //   // ...increaseAllowanceMessages,
  //   executeAddLiquidityMessage,
  // ]

  const createClosPositionMessage = (unbonding_duration: number) => {

    console.log({unbonding_duration})

    const msg = createExecuteMessage({
      message: {
        close_position: {
          unbonding_duration
        },
      },
      senderAddress: address,
      contractAddress: pool?.staking_address,
      funds: [],
    })

    return [
      msg,
    ]

  }

  // console.log({
  //   msgs,
  //   allowance: JSON.parse(fromUtf8(increaseAllowanceMessages[0].value.msg)),
  //   execute: JSON.parse(fromUtf8(executeAddLiquidityMessage.value.msg))
  // })

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async ({ unbonding_duration }: { unbonding_duration: number }) => {

      const msgs = createClosPositionMessage(unbonding_duration)

      console.log({closeMsg : msgs})

      return validateTransactionSuccess(
        await client.post(address, msgs)
      )
    },
    onError,
    onSuccess
  })


  return useMemo(() => {
    return {
      submit,
      ...state,
      ...tx
    }
  }, [tx, state, submit])

  // console.log({
  //   meessages : [
  //     ...increaseAllowanceMessages,
  //     executeAddLiquidityMessage,
  //   ],
  //   allowance: JSON.parse(fromUtf8(increaseAllowanceMessages[0].value.msg)),
  //   msgs: JSON.parse(fromUtf8(executeAddLiquidityMessage.value.msg))
  // })

  // return validateTransactionSuccess(
  //   await client.post(senderAddress, )
  // )
}
