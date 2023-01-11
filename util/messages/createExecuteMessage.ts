import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { Coin } from '@cosmjs/launchpad'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { coin } from '@cosmjs/stargate'
import getChainName from 'libs/getChainName'
import { EncodeObject } from '@cosmjs/proto-signing'

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
