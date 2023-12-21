import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService, getInjectiveFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const withdrawTokens: any = async (
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient,
  cosmWasmClient: CosmWasmClient,
  address: string,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    withdraw: {
      denom,
    },
  }

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.whale_lair,
    message: handleMsg,
    funds: [] })
  let fee: any = 'auto'
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(null, gas)
  } else if (await signingClient.getChainId() === ChainId.injective) {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    const injectiveTxData = await signingClient.sign(
      address, [execMsg], getInjectiveFee(gas), '',
    )
    return await cosmWasmClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], fee, '',
  )
}
