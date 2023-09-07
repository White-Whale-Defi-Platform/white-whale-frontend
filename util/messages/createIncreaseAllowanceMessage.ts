import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

type CreateIncreaseAllowanceMessageArgs = {
  senderAddress: string
  tokenAmount: string
  tokenAddress: string
  swapAddress: string
}

export const createIncreaseAllowanceMessage = ({
  senderAddress,
  tokenAmount,
  tokenAddress,
  swapAddress,
}: CreateIncreaseAllowanceMessageArgs): MsgExecuteContractEncodeObject => ({
  typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
  value: MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: tokenAddress,
    msg: toUtf8(JSON.stringify({
      increase_allowance: {
        amount: `${Number(tokenAmount)}`,
        spender: `${swapAddress}`,
      },
    })),
    funds: [],
  }),
})
