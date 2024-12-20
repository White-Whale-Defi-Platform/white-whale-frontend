import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { ADV_MEMO } from 'constants/index'
import { createGasFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const withdraw: any = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  denom: string,
  amount: number,
) => {
  const handleMsg1 = {
    unstake: {
      recipient: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
    },
  }
  const handleMsg2 = {
    withdraw_lp: {
      stage: {
        white_whale: {
          pair: 'terra17vas9rhxhc6j6f5wrup9cqapxn74jvpft069py7l7l9kr7wx3tnsxrazux',
        },
      },
    },
  }
  console.log(denom, amount)

  const execMsg1 = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx',
    message: handleMsg1,
    funds: [{ amount: Math.ceil(amount).toString(),
      denom }] })

  const execMsg2 = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
    message: handleMsg2,
    funds: [] })
  const messages = denom.includes('amplp') ? [execMsg1, execMsg2] : [execMsg2]
  return await signingClient.signAndBroadcast(
    address, messages, await createGasFee(
      signingClient, address, messages,
    ), ADV_MEMO,
  )
}
