import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { oldPool } from 'components/Pages/Trade/Migrate/constants'
import { ADV_MEMO } from 'constants/index'
import { createGasFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const withdraw: any = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  lpTokens: {denom: string, amount: number}[],
) => {
  const withdrawWWLp = {
    withdraw_liquidity: {},
  }

  const unstakeAmpLp = {
    unstake: {
      recipient: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
    },
  }

  const unstakeErisLp = {
    unstake: {
      asset: {
        amount: lpTokens[1].amount,
        info: {
          native: lpTokens[1].denom,
        },
      },
      recipient: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
    },
  }

  const withdrawErisLp = {
    withdraw_lp: {
      stage: {
        white_whale: {
          pair: oldPool,
        },
      },
    },
  }

  const execMsgUnstakeAmpLp = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx',
    message: unstakeAmpLp,
    funds: [{ amount: Math.ceil(lpTokens[2].amount * (10 ** 6)).toString(),
      denom: lpTokens[2].denom }] })

  const execMsgUnstakeErisLp = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra14mmvqn0kthw6sre75vku263lafn5655mkjdejqjedjga4cw0qx2qlf4arv',
    message: unstakeErisLp,
    funds: [] })

  const execMsgWithdrawErisLp = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
    message: withdrawErisLp,
    funds: [] })

  const execMsgWithdrawWWLp = createExecuteMessage({ senderAddress: address,
    contractAddress: oldPool,
    message: withdrawWWLp,
    funds: [{
      amount: (lpTokens[0].amount * (10 ** 6)).toString(),
      denom: lpTokens[0].denom,
    }] })
  const messages = []

  if (lpTokens[2].amount > 0) {
    messages.push(execMsgUnstakeAmpLp)
  }
  if (lpTokens[1].amount > 0) {
    messages.push(execMsgUnstakeErisLp)
    messages.push(execMsgWithdrawErisLp)
  }
  if (lpTokens[0].amount > 0) {
    messages.push(execMsgWithdrawWWLp)
  }
  console.log({lpTokens})
  console.log({messages})
  return await signingClient.signAndBroadcast(
    address, messages, await createGasFee(
      signingClient, address, messages,
    ), ADV_MEMO,
  )
}
