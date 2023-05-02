import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { fromUtf8 } from '@cosmjs/encoding'
import { coin } from '@cosmjs/stargate'

// import { TokenInfo } from '../../queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'
import { Wallet } from 'util/wallet-adapters'
import { toChainAmount } from '../../../../libs/num'

type BondLpProps = {
  amount : number
  lpAddress : string
  stakingAddress : string
  senderAddress : string
  msgs : any
  client : Wallet
}

export const bondLp = async ({
  amount,
  lpAddress,
  stakingAddress,
  senderAddress,
  msgs,
  client,
  
}: BondLpProps): Promise<any> => {
    const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: Number(amount),
          tokenAddress: lpAddress,
          senderAddress,
          swapAddress : stakingAddress ,
        })
      )

    const executeAddLiquidityMessage = createExecuteMessage({
      message: msgs,
      senderAddress,
      contractAddress: stakingAddress,
      /* each native token needs to be added to the funds */
      funds: [],
    })

    

    // console.log({
    //   meessages : [
    //     ...increaseAllowanceMessages,
    //     executeAddLiquidityMessage,
    //   ],
    //   allowance: JSON.parse(fromUtf8(increaseAllowanceMessages[0].value.msg)),
    //   msgs: JSON.parse(fromUtf8(executeAddLiquidityMessage.value.msg))
    // })

    return validateTransactionSuccess(
      await client.post(senderAddress, [
        ...increaseAllowanceMessages,
        executeAddLiquidityMessage,
      ])
    )
}
