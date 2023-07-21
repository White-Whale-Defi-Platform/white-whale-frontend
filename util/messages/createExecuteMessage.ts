import { toUtf8 } from '@cosmjs/encoding'
import { Coin } from '@cosmjs/launchpad'
import { EncodeObject } from '@cosmjs/proto-signing'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

type CreateExecuteMessageArgs = {
  senderAddress: string
  message: any
  contractAddress: string
  funds?: Array<Coin>
}

export const createExecuteMessage = ({
  senderAddress,
  contractAddress,
  message,
  funds,
}: CreateExecuteMessageArgs): EncodeObject => ({
  typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
  value: MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: contractAddress,
    msg: toUtf8(JSON.stringify(message)),
    funds: funds || [],
  }),
})
