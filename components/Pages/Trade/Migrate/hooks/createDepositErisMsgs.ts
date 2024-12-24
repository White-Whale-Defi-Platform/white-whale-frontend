import { newPool } from 'components/Pages/Trade/Migrate/constants'
import { createExecuteMessage } from 'util/messages/index'

export const createDepositErisMsgs = (
  address: string, tokenAmount: string, assets: {denom: string, amount: string}[],
) => {
  const createLpMessage = {
    create_lp: {
      min_received: tokenAmount,
      assets: [
        {
          native: 'ibc/2C962DAB9F57FE0921435426AE75196009FAA1981BF86991203C8411F8980FDB',
        },
        {
          native: 'ibc/9B19062D46CAB50361CE9B0A3E6D0A7A53AC9E7CB361F32A73CC733144A9A9E5',
        },
      ],
      stage: {
        white_whale: {
          pair: newPool,
        },
      },
      post_action: {
        stake: {
          asset_staking: 'terra14mmvqn0kthw6sre75vku263lafn5655mkjdejqjedjga4cw0qx2qlf4arv',
          receiver: null,
        },
      },
    },
  }

  return [
    createExecuteMessage({
      senderAddress: address,
      contractAddress: 'terra1qdjsxsv96aagrdxz83gwtjk8qvf2mrg4y8y3dqjxg556lm79pg5qdgmaxl',
      message: createLpMessage,
      funds: assets,
    }),
  ]
}
