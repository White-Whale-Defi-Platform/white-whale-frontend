import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { createGasFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const bondTokens: any = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  amount: number,
  denom: string,
  config: Config,
  injectiveSigningClient?: InjectiveSigningStargateClient
) => {
  const handleMsg = {
    bond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom,
          },
        },
      },
    },
  }
  const execMsg = createExecuteMessage({
    senderAddress: address,
    contractAddress: config.whale_lair,
    message: handleMsg,
    funds: [coin(amount, denom)]
  })
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await injectiveSigningClient.sign(
      address, [execMsg], await createGasFee(injectiveSigningClient,address,[execMsg],null), ADV_MEMO,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], await createGasFee(signingClient, address, [execMsg], null), ADV_MEMO,
  )
}

