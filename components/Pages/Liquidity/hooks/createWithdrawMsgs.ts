import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { createExecuteMessage } from 'util/messages'
import { createIncreaseAllowanceMessage } from 'util/messages'

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export const createWithdrawMsg = ({ contract, amount, swapAddress }) => {
  return {
    send: {
      amount,
      contract: swapAddress,
      msg: toBase64({
        withdraw_liquidity: {},
      }),
    },
  }
}

export const createWithdrawExecuteMsgs = (
  { contract, amount, swapAddress, claimIncentive, stakingAddress },
  senderAddress
) => {
  const msgs = []
  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

  increaseAllowanceMessages.push(
    createIncreaseAllowanceMessage({
      tokenAmount: amount,
      tokenAddress: contract,
      senderAddress,
      swapAddress,
    })
  )

  const inventiveMsg = createExecuteMessage({
    message: {
      withdraw: {}
    },
    senderAddress,
    contractAddress: stakingAddress,
    funds: [],
  })

  
  if(claimIncentive)
    msgs.push(inventiveMsg)



  return [
    ...msgs,
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: contract,
      message: createWithdrawMsg({ contract, amount, swapAddress }),
    }),
  ]
}
