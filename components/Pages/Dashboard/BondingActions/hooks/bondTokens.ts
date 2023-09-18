import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { TerraTreasuryService } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const bondTokens = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  amount: number,
  denom: string,
  config: Config,
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
  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.whale_lair,
    message: handleMsg,
    funds: [coin(amount, denom)] })
  let fee = 'auto'
  if (await signingClient.getChainId() === 'columbus-5') {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      amount, denom, gas,
    )
  }

  return await signingClient.signAndBroadcast(
    // @ts-ignore
    address, [execMsg], fee, ''
  )
}

