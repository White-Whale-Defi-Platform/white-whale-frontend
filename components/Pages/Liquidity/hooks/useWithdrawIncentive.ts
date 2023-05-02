import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate"
import { useMutation } from "react-query"
import { createExecuteMessage, createIncreaseAllowanceMessage, validateTransactionSuccess } from "../../../../util/messages"


const useWtihdrawIncentive = () => {

    const msgs = () => {
        return {
          withdraw: {},
        }
      }

    return useMutation({
        mutationFn: async ({
            client,

        }:any) => {
            const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

            increaseAllowanceMessages.push(
              createIncreaseAllowanceMessage({
                tokenAmount: 6539,
                tokenAddress: "migaloo1ff55scggwlgulr8tjmmtg0wyvd4xssyu6kjz84t4602gzt22nf8q6ztfr4",
                senderAddress : "migaloo1luw6vqtnxx96s094t5hchu6xx9t3fw9g4cpr53",
                swapAddress : "migaloo1r8cddcpud6mxgdaktun7rcexqjyfk3rxadu35y745zt8lustnudqdt5j0n" ,
              })
            )
      
          const executeAddLiquidityMessage = createExecuteMessage({
            message: msgs(),
            senderAddress : "migaloo1luw6vqtnxx96s094t5hchu6xx9t3fw9g4cpr53",
            contractAddress: "migaloo1r8cddcpud6mxgdaktun7rcexqjyfk3rxadu35y745zt8lustnudqdt5j0n" ,
            /* each native token needs to be added to the funds */
            funds: [],
          })
      
          
      
        //   console.log({
        //     meessages : [
        //       ...increaseAllowanceMessages,
        //       executeAddLiquidityMessage,
        //     ],
        //     allowance: JSON.parse(fromUtf8(increaseAllowanceMessages[0].value.msg)),
        //     msgs: JSON.parse(fromUtf8(executeAddLiquidityMessage.value.msg))
        //   })
      
          return validateTransactionSuccess(
            await client.post("migaloo1luw6vqtnxx96s094t5hchu6xx9t3fw9g4cpr53", [
              ...increaseAllowanceMessages,
              executeAddLiquidityMessage,
            ])
          )
        }
    })
}

export default useWtihdrawIncentive