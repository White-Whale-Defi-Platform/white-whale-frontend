import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { ADV_MEMO } from 'constants/index'
import { createGasFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const deposit: any = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  denom: string,
  amount: number,
) => {
  const ampLpPostMessage = {
    liquid_stake: {
      compounder: 'terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx',
      receiver: null,
      gauge: 'bluechip',
    },
  }
  const lpPostMessage = {
    stake: {
      asset_staking: 'terra14mmvqn0kthw6sre75vku263lafn5655mkjdejqjedjga4cw0qx2qlf4arv',
      receiver: null,
    },
  }

  const handleMsg1 = {
    create_lp: {
      min_received: '6307',
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
          pair: 'terra17vas9rhxhc6j6f5wrup9cqapxn74jvpft069py7l7l9kr7wx3tnsxrazux',
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

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: 'terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx',
    message: handleMsg1,
    funds: [{ amount: Math.ceil(amount).toString(),
      denom }] })
  return await signingClient.signAndBroadcast(
    address, [execMsg], await createGasFee(
      signingClient, address, [execMsg],
    ), ADV_MEMO,
  )
}
