import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { ChainId } from 'constants/index'
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
  let fee: any = 'auto'
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      execMsg.value.funds, gas,
    )
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], fee, '',
  )
}

